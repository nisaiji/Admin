import { RotatingLines } from "react-loader-spinner";
import Loader from "../assets/images/Loader.gif";
export default function Spinner() {
  return (
    <div className="h-full w-full flex flex-row justify-center items-center">
      {/* <RotatingLines
        strokeColor="gray"
        strokeWidth="5"
        animationDuration="0.75"
        width="96"
        visible={true}
      /> */}
      <img src={Loader} alt="" className="size-24" />
      {/* <div>Data is Loading Please Wait... </div> */}
    </div>
  );
}
