import { Dispatch, SetStateAction } from "react";

interface ModalProps {
    open: boolean;
    data: any,
    setData: Dispatch<SetStateAction<any>>
}


const Modal = ({ open, data,setData }: ModalProps) => {
    return (
        <div className={`${open ? 'block' : 'hidden'} fixed top-0 left-0 h-screen w-full flex items-center justify-center bg-black bg-opacity-15`}>
            <div className="bg-white backdrop-blur-2xl rounded p-5 relative">
                <div className="bg-red-600 absolute -top-2 -right-2 cursor-pointer text-white w-8 h-8 flex items-center justify-center rounded-full"
                    onClick={()=>{
                        setData({
                            open: false,
                            data:{}
                        })
                    }}
                >
                    x
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">T&A DATA</h3>
                <div className="grid md:grid-cols-2 gap-x-2 min-w-fit">
                    <div className="mb-2">
                        <span className="font-semibold text-md">Start Date :</span> {data?.startDate}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">End Date :</span> {data?.endDate}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Production Per Day :</span> {data?.productionRate}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Total Order Quantity :</span> {data?.totalOrder}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Fabric Name :</span> {data?.fabric_name}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Per Piece Requirement :</span> {data?.perPiece}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Processes :</span> {data?.process}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Choose Unit :</span> {data?.unit}
                    </div>
                    {
                        data?.color?.length > 0 &&
                        <div className="mb-2">
                            <span className="font-semibold text-md">Color And Quantity :</span> {data?.color?.map((item: any, i: number) =>
                                <span key={i} className="bg-gray-700 rounded text-white px-3 py-1">{item?.name} : {item?.value}</span>
                            )}
                        </div>
                    }
                    <div className="mb-2">
                        <span className="font-semibold text-md">Stages to Be SKipped :</span> {data?.skipped}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Is China Fabric Present :</span> {data?.china_present}
                    </div>
                    {
                        data?.chinaFabric !== '' &&
                        <div className="mb-2">
                            <span className="font-semibold text-md">China Fabric :</span> {data?.chinaFabric}
                        </div>
                    }
                    <div className="mb-2">
                        <span className="font-semibold text-md">Major Fabric :</span> {data?.major_fabric}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Trims :</span> {data?.Trims}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold text-md">Accessories :</span> {data?.accessories}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal