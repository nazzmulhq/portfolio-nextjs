import { IRoutes } from "../types";
import { PERMISSIONS } from "./permissions";

// Define your protected routes and required PERMISSION
export const PROTECTED_ROUTES: IRoutes[] = [
    {
        type: "protected",
        children: [],
        parentId: null,
        name: "Home",
        path: "/",
        isComponent: false,
        permissions: [PERMISSIONS.HOME.INDEX],
    },
];
