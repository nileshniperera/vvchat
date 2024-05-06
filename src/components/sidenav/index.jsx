import { Children } from "react";

export const SideNav = ({ children }) => {
    const wrappedChildren = Children.toArray(children)
        .map((child, id) => {
            if (child) {
                // This check ensures that only valid children are processed
                return (
                    <div key={id} className="side-nav-wrapper">
                        {child}
                    </div>
                );
            }
            return null; // Explicitly return null for invalid children
        })
        .filter((child) => child !== null); // Filter out null values

    return <div className="sidenav h-dvh border-t-2">{wrappedChildren}</div>;
};
