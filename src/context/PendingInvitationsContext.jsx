import { createContext, useContext, useMemo,useEffect,useRef } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { CardsSkeleton } from "@/components/common/States";
import { useAsync } from "@/hooks/useAsync";
import { invitationsService } from "@/services";

const PendingInvitationsContext = createContext(null);

export function PendingInvitationsProvider() {
  const { user } = useSession();
  const location = useLocation();

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => {
      if (!user?.id) return Promise.resolve([]);
      return invitationsService.getMyInvitations();
    },
    [user?.id],
  );

  const invitations = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.invitations ?? [];
  }, [data]);

  const hasInvitations = invitations.length > 0;
  


const instance = useRef(Math.random().toString(36).slice(2));

useEffect(() => {
  console.log("Provider mounted:", instance.current);

  return () => {
    console.log("Provider unmounted:", instance.current);
  };
}, []);

  const value = useMemo(
    () => ({
      invitations,
      loading,
      error,
      reload,
      hasInvitations,
      invitationCount: invitations.length,
    }),
    [invitations, loading, error, reload, hasInvitations],
  );

  if (loading) {
    return <CardsSkeleton />;
  }

  if (
 !error &&
    hasInvitations &&
    location.pathname !== "/app/invitations/accept"
  ) {
    return (
      <Navigate
        to="/app/invitations/accept"
        replace
      />
    );
  }

  return (
    <PendingInvitationsContext.Provider value={value}>
      <Outlet />
    </PendingInvitationsContext.Provider>
  );
}

export function usePendingInvitations() {
  const context = useContext(PendingInvitationsContext);

  if (!context) {
    throw new Error(
      "usePendingInvitations must be used within PendingInvitationsProvider",
    );
  }

  return context;
}