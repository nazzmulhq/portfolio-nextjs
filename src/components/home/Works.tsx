import { FC } from "react";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    return (
        <section className="" id="works">
            <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                Works
            </h2>
            <div className="w-full px-4 pb-4 mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div className=" border border-white" key={i}>
                            <img
                                alt=""
                                className="object-cover w-full h-48 rounded-t opacity-80"
                                src="https://images.unsplash.com/photo-1557683316-973673baf926?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-bold">
                                    The origin
                                </h3>
                                <p>
                                    Pretium lectus quam id leo. Urna et pharetra
                                    pharetra massa massa. Adipiscing enim eu
                                    neque aliquam vestibulum morbi blandit
                                    cursus risus.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Works;
