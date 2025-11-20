"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { hasAdminUser } from '@/lib/auth-actions';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['user', 'admin']).default('user'),
});

type RegisterFormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const functions = getFunctions(app);
  const auth = getAuth(app);
  const createFirebaseUser = httpsCallable(functions, 'createFirebaseUser');

  useEffect(() => {
    const checkAdmin = async () => {
      setCheckingAdmin(true);
      try {
        const hasAdmin = await hasAdminUser();
        setShowAdminOption(!hasAdmin);
      } catch (error) {
        console.error("Failed to check for admin user:", error);
        setShowAdminOption(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'user',
    },
  });
  
  // When the admin option visibility changes, reset the role field if it's hidden
  useEffect(() => {
    if (!showAdminOption) {
      form.setValue('role', 'user');
    }
  }, [showAdminOption, form]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setLoading(true);
    try {
      // 1. Call the Cloud Function to securely create the user, set claims, and create a DB entry.
      await createFirebaseUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
      });

      toast({ title: 'Registration Successful', description: `Welcome, ${data.fullName}! Logging you in...` });

      // 2. Sign the new user in on the client.
      // The useAuth hook will handle redirection based on the (now set) custom claim.
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // The router.push is handled by the useAuth hook, which is the source of truth.
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Could not create your account.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <Calculator className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-balance text-muted-foreground">Enter your details below to create your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {checkingAdmin ? (
              <div className="h-10 animate-pulse bg-muted rounded-md" />
            ) : (
              showAdminOption && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
