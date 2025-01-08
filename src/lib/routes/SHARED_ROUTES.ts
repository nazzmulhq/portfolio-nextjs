import { IRoutes } from "../types";
import { PERMISSIONS } from "./permissions";

// Define your shared routes here and authenticate or non-authenticated user can access those routes
const SHARED_ROUTES: IRoutes[] = [
    {
        type: "shared",
        path: "/quick-cicd",
        children: [],
        parentId: null,
        name: "Profile",
        isComponent: false,
        permissions: [PERMISSIONS.GLOBAL],
    },
];

export default SHARED_ROUTES;
