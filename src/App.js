import Login from "./components/auth/login";
import Register from "./components/auth/register";

import Header from "./components/header";
import Feed from "./components/feed";
import Guild from "./components/guild";
import GuideSeeker from "./components/guideseeker";
import Healthbot from "./components/healthbot";
import ViewProfile from "./components/viewprofile";
import Onboarding from "./components/onboarding";
import { Admin } from "./components/admin";
import { RouteWrapper } from "./components/routewrapper";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";

import "./App.css";
import "./chatstyling.css";

function App() {
    const routesArray = [
        {
            path: "*",
            element: <RouteWrapper Route={Login} />,
        },
        {
            path: "/login",
            element: <RouteWrapper Route={Login} />,
        },
        {
            path: "/register",
            element: <RouteWrapper Route={Register} />,
        },
        {
            path: "/feed",
            element: <RouteWrapper Route={Feed} />,
        },
        {
            path: "/guild",
            element: <RouteWrapper Route={Guild} />,
        },
        {
            path: "/guide-seeker",
            element: <RouteWrapper Route={GuideSeeker} />,
        },
        {
            path: "/healthbot",
            element: <RouteWrapper Route={Healthbot} />,
        },
        {
            path: "/view-profile",
            element: <RouteWrapper Route={ViewProfile} />,
        },
        {
            path: "/onboarding",
            element: <RouteWrapper Route={Onboarding} />,
        },
        {
            path: "/admin",
            element: <RouteWrapper Route={Admin} />,
        },
    ];
    let routesElement = useRoutes(routesArray);

    return (
        <AuthProvider>
            <Header />
            {routesElement}
        </AuthProvider>
    );
}

export default App;
