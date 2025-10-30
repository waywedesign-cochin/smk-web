"use client";

import { GraduationCap, BellIcon, Loader2, User } from "lucide-react";
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
import { useEffect, useRef, useState } from "react";
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
import Link from "next/link";

export default function DashboardSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser: user, loading } = useAppSelector((state) => state.users);

  const [currentPage, setCurrentPage] = useState("overview");
  const [checkedUser, setCheckedUser] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchCurrentUser()).finally(() => setCheckedUser(true));
    } else {
      setCheckedUser(true);
    }
  }, [dispatch]);

  //logout
  const handleLogout = async () => {
    isLoggingOutRef.current = true;
    await dispatch(logoutUser());
    localStorage.removeItem("token");
    router.push("/signin");
    setLogoutDialogOpen(false);
  };

  // redirect effect
  useEffect(() => {
    if (checkedUser && !loading && !user && !isLoggingOutRef.current) {
      toast.error("Please sign in to continue");
      router.push("/signin");
    }
  }, [user, loading, checkedUser, router]);

  const onPageChange = (page: string) => {
    router.push(`/${page}`);
    setCurrentPage(page);
  };

  // Show loader while fetching user or before client hydration
  if (!checkedUser || loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <SidebarProvider className="  border-0 ">
      <div className="flex h-screen w-full bg-black ">
        {/* Sidebar */}
        <Sidebar className="overflow-hidden  border-gray-100/10 ">
          <SidebarHeader className="p-6 border-0 bg-black text-white">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">SK & SL Associate</h1>
                <p className="text-sm text-white">Private Limited</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="bg-gradient-to-b from-black to-[#122147] text-white border-0">
            <SidebarMenu className="p-3">
              {menuItems.map((item) => {
                if (item.id === "users" && user.role !== 1) {
                  return null;
                }

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onPageChange(item.id)}
                      isActive={currentPage === item.id}
                      tooltip={item.description}
                      className="hover:bg-blue-100/10 hover:text-white"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4 bg-[#122147] text-white">
            <div className="text-sm text-white">
              <p>Logged in as</p>
              <p className="font-semibold text-white">
                {user.username} (
                {user.role === 1
                  ? "Admin"
                  : user.role === 2
                  ? "Director"
                  : user.role === 3
                  ? "Staff"
                  : "Unknown"}
                )
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden ">
          <header className="border-b border-gray-100/10 bg-black text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-xl font-semibold capitalize">
                {menuItems.find((item) => item.id === currentPage)?.label ||
                  "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-gray-600/20" variant="outline" size="sm">
                <User className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-black border border-white"
              >
                <BellIcon className="h-4 w-4  hover:text-black" />
              </Button>

              {/* Logout with confirmation dialog */}
              <Dialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-gray-600/20"
                    variant="outline"
                    size="sm"
                  >
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
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-black text-white">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
