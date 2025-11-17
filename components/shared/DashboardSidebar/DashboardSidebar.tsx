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
import { useSidebar } from "@/components/ui/sidebar"; // ✅ import

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
import { usePathname } from "next/navigation";

export default function DashboardSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser: user, loading } = useAppSelector((state) => state.users);
  const { isMobile, setOpenMobile } = useSidebar(); // ✅ use this hook

  const pathname = usePathname();
  const currentPage = pathname === "/" ? "/" : pathname.split("/")[1];
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

    // ✅ close sidebar only if on mobile
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Show loader while fetching user or before client hydration
  if (!checkedUser || loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
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

        <SidebarFooter className="relative border-t border-white/10 p-4 bg-gradient-to-br from-[#0f1b3d] via-[#122147] to-[#1a2d5f] backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-3 group">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/20 ring-2 ring-white/20 transition-transform group-hover:scale-105">
                <span className="text-sm font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#122147]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-blue-300/60 font-semibold mb-0.5">
                Logged in
              </p>
              <p className="font-semibold text-white truncate text-sm mb-1">
                {user.username}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 shadow-inner">
                <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse" />
                <span className="text-xs font-medium text-white/90">
                  {user.role === 1
                    ? "Admin"
                    : user.role === 2
                    ? "Director"
                    : user.role === 3
                    ? "Staff"
                    : "Unknown"}
                </span>
              </div>
            </div>
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
            <Button
              onClick={() => router.push("/profile")}
              className="bg-gray-600/20"
              variant="outline"
              size="sm"
            >
              <User className="h-4 w-4" />
            </Button>

            {/* <Button
              variant="outline"
              size="sm"
              className="bg-black border border-white"
            >
              <BellIcon className="h-4 w-4  hover:text-black" />
            </Button> */}

            {/* Logout with confirmation dialog */}
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-600/20" variant="outline" size="sm">
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
  );
}
