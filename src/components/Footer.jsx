import {
  FaLinkedin,
  FaInstagramSquare,
  FaTwitterSquare,
  FaFacebookSquare,
} from 'react-icons/fa';

export default function Footer () {
  return (
    <div className="text-white w-full bg-blue-950 flex flex-col justify-center items-center md:items-start  md:flex-row md:justify-around py-4 gap-4">
      <div>
        <div className="flex flex-col justify-center items-center">
          <div className="font-bold text-2xl italic">LOGO</div>
          <div>Lorem ipsum dolor sit.</div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <div className="text-xl">Product</div>
          <div className="border-2  rounded-2xl sm:w-32" />
        </div>
        <div className="sm:block flex gap-8">
          <div className="">
            <div>FAQs</div>
            <div>services</div>
          </div>
          <div>
            <div>License</div>
            <div>support</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="text-xl text-center sm:text-left">Company</div>
          <div className="border-2  rounded-2xl sm:w-32" />
        </div>
        <div className="sm:block flex gap-8">
          <div className="">
            <div>About us</div>
            <div>Privacy Policy</div>
          </div>
          <div>
            <div>Term Policy</div>
            <div>Refund Policy</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 ">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <div className="text-xl">Contact</div>
          <div className=" border-2  rounded-2xl sm:w-36" />
        </div>
        <div className="flex gap-4 text-2xl">
          <div><FaLinkedin /></div>
          <div><FaInstagramSquare /></div>
          <div><FaTwitterSquare /></div>
          <div><FaFacebookSquare /></div>
        </div>
      </div>
    </div>
  );
}
