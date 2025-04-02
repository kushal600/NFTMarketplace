
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";
  import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile (data) {
    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    return (
        // <Link to={newTo}>
        // <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
        //     <img src={IPFSUrl} alt="" className="w-72 h-80 rounded-lg object-cover" crossOrigin="anonymous" />
        //     <div className= "text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
        //         <strong className="text-xl">{data.data.name}</strong>
        //         {/* <p className="display-inline">
        //             {data.data.description}
        //         </p> */}
        //     </div>
        // </div>
        // </Link>
        <div className="p-4"> {/* Added padding around each card */}
            <Link to={newTo}>
                <div className="flex flex-col items-center bg-white rounded-[15px] p-5 w-full shadow-[0_4px_8px_rgba(0,0,0,0.1)] text-black relative transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] h-full">
                    <img 
                        src={IPFSUrl} 
                        alt={data.data.name} 
                        className="w-72 h-80 rounded-lg object-cover" 
                        crossOrigin="anonymous" 
                    />
                    <div className="w-full p-2 mt-4 text-center">
                        <strong className="text-xl">{data.data.name}</strong>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default NFTTile;
