"use client";

import { GraduationCap, BellIcon, Loader2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { menuItems } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCurrentUser, logoutUser } from "@/redux/features/user/userSlice";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DashboardSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState("overview");
  const { currentUser: user, loading } = useAppSelector((state) => state.users);

  const [checkedUser, setCheckedUser] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => setCheckedUser(true));
  }, [dispatch]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (checkedUser && !loading && !user) {
      !logoutDialogOpen && toast.error("Please sign in to continue");
      router.push("/signin");
    }
  }, [user, loading, checkedUser, router]);

  //logout function
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/signin");
    toast.success("Logged out successfully");
    setLogoutDialogOpen(false);
  };
  const onPageChange = (page: string) => {
    router.push(`/${page}`);
    setCurrentPage(page);
  };

  // Show loader while fetching user or if user is null
  if (loading || !checkedUser || !user)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">StockForx</h1>
                <p className="text-sm text-sidebar-foreground/60">
                  Institute Management
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu className="p-3">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    isActive={currentPage === item.id}
                    tooltip={item.description}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="text-sm text-sidebar-foreground/60">
              <p>Logged in as</p>
              <p className="font-semibold text-black">
                {user?.username} (
                {user?.role === 1
                  ? "Staff"
                  : user?.role === 2
                  ? "Director"
                  : user?.role === 3
                  ? "Admin"
                  : "Unknown"}
                )
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b bg-background px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-xl font-semibold capitalize">
                {menuItems.find((item) => item.id === currentPage)?.label ||
                  "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Profile
              </Button>

              {/* Logout with confirmation dialog */}
              <Dialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Logout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to logout? You will need to sign in
                      again.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setLogoutDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      Logout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm">
                <BellIcon className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
