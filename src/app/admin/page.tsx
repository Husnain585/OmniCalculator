import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import admin from '@/lib/firebase-admin';
import { format } from 'date-fns';

async function getUsers() {
  const userRecords = await admin.auth().listUsers();
  return userRecords.users.map((user) => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime,
    disabled: user.disabled,
    isAdmin: user.customClaims?.admin === true,
  }));
}

export default async function AdminDashboardPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Signed In</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="font-medium">{user.email || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      UID: {user.uid}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.creationTime), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.lastSignInTime), 'MMM d, yyyy, p')}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {user.disabled ? (
                      <Badge variant="destructive">Disabled</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                    {user.isAdmin && <Badge>Admin</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
