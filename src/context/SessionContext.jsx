// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// const KEY = "intervia.session.v1";
// const SessionContext = createContext(null);

// const load = () => {
//   try {
//     return JSON.parse(localStorage.getItem(KEY)) || null;
//   } catch {
//     return null;
//   }
// };

// export function SessionProvider({ children }) {
//   const [session, setSession] = useState(load);

//   useEffect(() => {
//     if (session) localStorage.setItem(KEY, JSON.stringify(session));
//     else localStorage.removeItem(KEY);
//   }, [session]);

//   const value = useMemo(() => {
//     const user = session?.user || null;
//     const orgId = session?.orgId;
//     const context = session?.context;
//     const role = session?.role;
//     return {
//       user,
//       role,
//       context,
//       orgId,
//       isAuthenticated: !!session,
//       signIn: (u) => {
//         const { user, organizations, context } = u;

//         if (!context) {
//           setSession({
//             user: { ...user },
//             context: "individual",
//             role: null,
//             orgId: null,
//           });
//           return;
//         }

//         const currOrg = organizations.find((org) => org.id === context);

//         setSession({
//           user: { ...user },
//           context: "organization",
//           orgId: currOrg?.id || null,
//           role: currOrg?.role || null,
//         });
//       },
//       signOut: () => setSession(null),
//       switchToIndividual: () =>
//         setSession((s) => ({
//           ...s,
//           context: "individual",
//           orgId: null,
//           role: null,
//         })),
//       switchOrg: (orgId, role) =>
//         setSession((s) => ({
//           ...s,
//           context: "organization",
//           orgId,
//           role: role,
//         })),
//     };
//   }, [session]);

//   return (
//     <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
//   );
// }

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const KEY = "intervia.session.v1";
const SessionContext = createContext(null);

const loadSession = () => {
  if (typeof window === "undefined") return null;

  try {
    const session = JSON.parse(localStorage.getItem(KEY));

    if (
      !session ||
      !session.user?.id ||
      !["individual", "organization"].includes(session.context)
    ) {
      return null;
    }

    if (
      session.context === "organization" &&
      !session.orgId
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === "undefined") return;

    try {
      if (session) {
        localStorage.setItem(KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(KEY);
      }
    } catch {
    }
  }, [session, initialized]);

  const value = useMemo(() => {
    return {
      user: session?.user || null,
      context: session?.context || null,
      orgId: session?.orgId || null,
      role: session?.role || null,
      orgName: session?.orgName || null,
      isAuthenticated: !!session?.user?.id,
      can:(roles)=>{
       if(roles?.includes(session?.role))return true;
       return false;
      },
      signIn: ({ user, organizations = [], context = null }) => {
        if (!user?.id) {
          throw new Error("Valid user information is required");
        }

        if (!context) {
          setSession({
            user,
            context: "individual",
            orgId: null,
            role: null,
            orgName: null
          });

          return;
        }

        const organization = organizations.find(
          (org) => org?.organization?.id === context
        );

        if (!organization) {
          throw new Error("Organization membership not found");
        }

        setSession({
          user,
          context: "organization",
          orgId: organization?.organization?.id,
          role: organization?.role || null,
          orgName: organization?.organization?.name
        });
      },

      signOut: () => {
        setSession(null);
      },

      switchToIndividual: () => {
        setSession((current) => {
          if (!current) return null;

          return {
            ...current,
            context: "individual",
            orgId: null,
            role: null,
            orgName:null
          };
        });
      },

      switchOrg: (org) => {
        setSession((current) => {
          if (!current) return null;

          return {
            ...current,
            context: "organization",
            orgId: org?.organization?.id,
            role: org?.role || null,
            orgName: org?.organization?.name
          };
        });
      },
    };
  }, [session]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}


export const useSession = () => useContext(SessionContext);
