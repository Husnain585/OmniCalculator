"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Calculator, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { hasAdminUser } from '@/lib/auth-actions';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  registerAsAdmin: z.boolean().default(false),
});

type RegisterFormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const auth = getAuth(app);
  const functions = getFunctions(app);

  useEffect(() => {
    async function checkAdminExists() {
      try {
        const hasAdmin = await hasAdminUser();
        setShowAdminOption(!hasAdmin);
      } catch (error) {
        console.error("Failed to check for admin user:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not verify admin status. Please try again later.'
        });
      } finally {
        setCheckingAdmin(false);
      }
    }
    checkAdminExists();
  }, [toast]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      registerAsAdmin: false,
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setLoading(true);
    try {
      const createFirebaseUser = httpsCallable(functions, 'createFirebaseUser');
      await createFirebaseUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        setAdmin: data.registerAsAdmin,
      });

      // After successful creation, log the user in
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (data.registerAsAdmin) {
        // Force a token refresh to get admin claims
        await userCredential.user.getIdToken(true);
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred. The email may already be in use.',
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
                <p className="text-balance text-muted-foreground">
                    Enter your details below to create your account
                </p>
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
                        <Input
                            placeholder="Jane Doe"
                            {...field}
                            disabled={loading}
                        />
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
                        <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                            disabled={loading}
                        />
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
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={loading}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                {checkingAdmin ? (
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  showAdminOption && (
                  <FormField
                    control={form.control}
                    name="registerAsAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                         <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                             <ShieldCheck className="h-4 w-4 text-primary" /> Register as Admin
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
            </Form>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Sign in
                </Link>
            </div>
        </div>
    </div>
  );
}
