"use client";
import { ProfilePage } from "@/components/profile/profile-page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { User } from "@/lib/types";
import { fetchCurrentUser, updateUser } from "@/redux/features/user/userSlice";

import React, { useEffect } from "react";
import toast from "react-hot-toast";

function Profile() {
  const dispatch = useAppDispatch();

  const { currentUser: user } = useAppSelector((state) => state.users);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);
  const handleSaveEdit = async (updatedUser: Partial<User>) => {
    await dispatch(updateUser(updatedUser)); // Dispatch update action to redux
    //need to logout once updated first show a toast saying you are logging out and redirect to login
    toast.loading("You Are logging out, please log in again", {
      duration: 3000,
    });

    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    }, 3000);
  };

  return (
    <ProfilePage
      user={user}
      onChangePassword={async () => alert("Not implemented")}
      onUpdateProfile={handleSaveEdit}
    />
  );
}

export default Profile;
