import Loader from "../assets/images/Loader.gif";

export default function Spinner() {
  return (
    <div className="h-full w-full flex flex-row justify-center items-center">
      <img src={Loader} alt="" className="size-24" />
    </div>
  );
}
