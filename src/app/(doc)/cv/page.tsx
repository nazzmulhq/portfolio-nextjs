import CVBtn from "@src/components/cv";
import { FC } from "react";

export interface IPage {}

const Page: FC<IPage> = () => {
    return (
        <main className="flex justify-center items-center h-screen">
            <CVBtn>Download CV</CVBtn>
        </main>
    );
};

export default Page;
