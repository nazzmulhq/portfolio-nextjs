"use client";
import { StyleProvider } from "@ant-design/cssinjs";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { FC } from "react";

export interface IProviders {
    children: React.ReactNode;
}

const Providers: FC<IProviders> = ({ children }) => {
    return (
        <>
            <AntdRegistry>
                <StyleProvider layer>{children}</StyleProvider>
            </AntdRegistry>
        </>
    );
};

export default Providers;
