const statesAndCity = {
  states: [
    {
      id: "1",
      name: "Andhra Pradesh",
      cities: [
        { id: "1", name: "Guntur" },
        { id: "2", name: "Nellore" },
        { id: "3", name: "Vijayawada" },
        { id: "4", name: "Visakhapatnam" },
      ],
    },
    {
      id: "2",
      name: "Arunachal Pradesh",
      cities: [
        { id: "1", name: "Itanagar" },
        { id: "2", name: "Pasighat" },
        { id: "3", name: "Tawang" },
        { id: "4", name: "Ziro" },
      ],
    },
    {
      id: "3",
      name: "Assam",
      cities: [
        { id: "1", name: "Dibrugarh" },
        { id: "2", name: "Guwahati" },
        { id: "3", name: "Silchar" },
        { id: "4", name: "Tezpur" },
      ],
    },
    {
      id: "4",
      name: "Bihar",
      cities: [
        { id: "1", name: "Bhagalpur" },
        { id: "2", name: "Gaya" },
        { id: "3", name: "Muzaffarpur" },
        { id: "4", name: "Patna" },
      ],
    },
    {
      id: "5",
      name: "Chhattisgarh",
      cities: [
        { id: "1", name: "Bilaspur" },
        { id: "2", name: "Bhilai" },
        { id: "3", name: "Korba" },
        { id: "4", name: "Raipur" },
      ],
    },
    {
      id: "6",
      name: "Delhi",
      cities: [
        { id: "1", name: "Dwarka" },
        { id: "2", name: "Karol Bagh" },
        { id: "3", name: "New Delhi" },
        { id: "4", name: "Rohini" },
      ],
    },
    {
      id: "7",
      name: "Goa",
      cities: [
        { id: "1", name: "Mapusa" },
        { id: "2", name: "Margao" },
        { id: "3", name: "Panaji" },
        { id: "4", name: "Vasco da Gama" },
      ],
    },
    {
      id: "8",
      name: "Gujarat",
      cities: [
        { id: "1", name: "Ahmedabad" },
        { id: "2", name: "Rajkot" },
        { id: "3", name: "Surat" },
        { id: "4", name: "Vadodara" },
      ],
    },
    {
      id: "9",
      name: "Haryana",
      cities: [
        { id: "1", name: "Ambala" },
        { id: "2", name: "Faridabad" },
        { id: "3", name: "Gurgaon" },
        { id: "4", name: "Panipat" },
      ],
    },
    {
      id: "10",
      name: "Himachal Pradesh",
      cities: [
        { id: "1", name: "Dharamshala" },
        { id: "2", name: "Manali" },
        { id: "3", name: "Shimla" },
        { id: "4", name: "Solan" },
      ],
    },
    {
      id: "11",
      name: "Jharkhand",
      cities: [
        { id: "1", name: "Bokaro" },
        { id: "2", name: "Dhanbad" },
        { id: "3", name: "Jamshedpur" },
        { id: "4", name: "Ranchi" },
      ],
    },
    {
      id: "12",
      name: "Karnataka",
      cities: [
        { id: "1", name: "Bengaluru" },
        { id: "2", name: "Hubli" },
        { id: "3", name: "Mangalore" },
        { id: "4", name: "Mysuru" },
      ],
    },
    {
      id: "13",
      name: "Kerala",
      cities: [
        { id: "1", name: "Kochi" },
        { id: "2", name: "Kozhikode" },
        { id: "3", name: "Thiruvananthapuram" },
        { id: "4", name: "Thrissur" },
      ],
    },
    {
      id: "14",
      name: "Madhya Pradesh",
      cities: [
        { id: "1", name: "Bhopal" },
        { id: "2", name: "Gwalior" },
        { id: "3", name: "Indore" },
        { id: "4", name: "Jabalpur" },
      ],
    },
    {
      id: "15",
      name: "Maharashtra",
      cities: [
        { id: "1", name: "Mumbai" },
        { id: "2", name: "Nagpur" },
        { id: "3", name: "Nashik" },
        { id: "4", name: "Pune" },
      ],
    },
    {
      id: "16",
      name: "Manipur",
      cities: [
        { id: "1", name: "Imphal" },
        { id: "2", name: "Kakching" },
        { id: "3", name: "Thoubal" },
        { id: "4", name: "Ukhrul" },
      ],
    },
    {
      id: "17",
      name: "Meghalaya",
      cities: [
        { id: "1", name: "Jowai" },
        { id: "2", name: "Nongpoh" },
        { id: "3", name: "Shillong" },
        { id: "4", name: "Tura" },
      ],
    },
    {
      id: "18",
      name: "Mizoram",
      cities: [
        { id: "1", name: "Aizawl" },
        { id: "2", name: "Champhai" },
        { id: "3", name: "Lunglei" },
        { id: "4", name: "Serchhip" },
      ],
    },
    {
      id: "19",
      name: "Nagaland",
      cities: [
        { id: "1", name: "Dimapur" },
        { id: "2", name: "Kohima" },
        { id: "3", name: "Mokokchung" },
        { id: "4", name: "Tuensang" },
      ],
    },
    {
      id: "20",
      name: "Odisha",
      cities: [
        { id: "1", name: "Bhubaneswar" },
        { id: "2", name: "Cuttack" },
        { id: "3", name: "Puri" },
        { id: "4", name: "Rourkela" },
      ],
    },
    {
      id: "21",
      name: "Punjab",
      cities: [
        { id: "1", name: "Amritsar" },
        { id: "2", name: "Jalandhar" },
        { id: "3", name: "Ludhiana" },
        { id: "4", name: "Patiala" },
      ],
    },
    {
      id: "22",
      name: "Rajasthan",
      cities: [
        { id: "1", name: "Jaipur" },
        { id: "2", name: "Jaisalmer" },
        { id: "3", name: "Jodhpur" },
        { id: "4", name: "Udaipur" },
      ],
    },
    {
      id: "23",
      name: "Sikkim",
      cities: [
        { id: "1", name: "Gangtok" },
        { id: "2", name: "Geyzing" },
        { id: "3", name: "Mangan" },
        { id: "4", name: "Namchi" },
      ],
    },
    {
      id: "24",
      name: "Tamil Nadu",
      cities: [
        { id: "1", name: "Chennai" },
        { id: "2", name: "Coimbatore" },
        { id: "3", name: "Madurai" },
        { id: "4", name: "Tiruchirappalli" },
      ],
    },
    {
      id: "25",
      name: "Telangana",
      cities: [
        { id: "1", name: "Hyderabad" },
        { id: "2", name: "Karimnagar" },
        { id: "3", name: "Nizamabad" },
        { id: "4", name: "Warangal" },
      ],
    },
    {
      id: "26",
      name: "Tripura",
      cities: [
        { id: "1", name: "Agartala" },
        { id: "2", name: "Dharmanagar" },
        { id: "3", name: "Kailashahar" },
        { id: "4", name: "Udaipur" },
      ],
    },
    {
      id: "27",
      name: "Uttar Pradesh",
      cities: [
        { id: "1", name: "Agra" },
        { id: "2", name: "Allahabad" },
        { id: "3", name: "Kanpur" },
        { id: "4", name: "Lucknow" },
      ],
    },
    {
      id: "28",
      name: "Uttarakhand",
      cities: [
        { id: "1", name: "Dehradun" },
        { id: "2", name: "Haridwar" },
        { id: "3", name: "Nainital" },
        { id: "4", name: "Rishikesh" },
      ],
    },
    {
      id: "29",
      name: "West Bengal",
      cities: [
        { id: "1", name: "Asansol" },
        { id: "2", name: "Durgapur" },
        { id: "3", name: "Kolkata" },
        { id: "4", name: "Siliguri" },
      ],
    },
  ],
};

export default statesAndCity;
