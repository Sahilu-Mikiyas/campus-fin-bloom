import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if caller is admin
    const { data: roleData } = await supabaseAdmin.rpc('get_user_role', { _user_id: caller.id });
    if (roleData !== 'admin') {
      console.log('Non-admin user attempted access:', caller.id);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...payload } = await req.json();
    console.log('Admin action:', action, 'by user:', caller.id);

    switch (action) {
      case 'list_users': {
        // List all users with their profiles and roles
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;

        const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
        const { data: roles } = await supabaseAdmin.from('user_roles').select('*');

        const combined = users.users.map((user) => {
          const profile = profiles?.find((p) => p.user_id === user.id);
          const role = roles?.find((r) => r.user_id === user.id);
          return {
            id: user.id,
            email: user.email,
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null,
            employee_id: profile?.employee_id || null,
            role: role?.role || 'viewer',
            created_at: user.created_at,
          };
        });

        return new Response(JSON.stringify({ users: combined }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create_user': {
        const { email, password, first_name, last_name, employee_id, role } = payload;

        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { first_name, last_name },
        });

        if (createError) {
          console.error('Create user error:', createError);
          throw createError;
        }

        console.log('Created user:', newUser.user.id);

        // Update profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ first_name, last_name, employee_id })
          .eq('user_id', newUser.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Assign role
        const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
          user_id: newUser.user.id,
          role: role || 'viewer',
        });

        if (roleError) {
          console.error('Role assign error:', roleError);
        }

        return new Response(JSON.stringify({ user: newUser.user }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_user': {
        const { user_id, first_name, last_name, employee_id, role } = payload;

        if (!user_id) {
          return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ first_name, last_name, employee_id })
          .eq('user_id', user_id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }

        // Upsert role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id, role }, { onConflict: 'user_id' });

        if (roleError) {
          console.error('Role update error:', roleError);
          throw roleError;
        }

        console.log('Updated user:', user_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_user': {
        const { user_id } = payload;

        if (!user_id) {
          return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Prevent self-delete
        if (user_id === caller.id) {
          return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Delete from auth (cascade will handle profiles and roles)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

        if (deleteError) {
          console.error('Delete user error:', deleteError);
          throw deleteError;
        }

        console.log('Deleted user:', user_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
