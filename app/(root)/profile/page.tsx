"use client";
import { ProfilePage } from "@/components/profile/profile-page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCurrentUser } from "@/redux/features/user/userSlice";

import React, { useEffect } from "react";

function Profile() {
  const dispatch = useAppDispatch();

  const { currentUser: user, loading } = useAppSelector((state) => state.users);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);
  return (
    <ProfilePage
      user={user}
      onChangePassword={async () => alert("change password")}
      onUpdateProfile={async () => alert("update profile")}
    />
  );
}

export default Profile;
