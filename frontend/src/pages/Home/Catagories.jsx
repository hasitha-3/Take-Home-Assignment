import React from "react";

const Catagories = (e) => {
  // console.log(e)
  return (
    <button className="flex justify-center items-center bg-gray-300 py-10 rounded mx-2 my-1 text-center text-4xl font-bold grow-2 w-1/6 hover:shadow-2xl hover:scale-103">
      {e.type}
    </button>
  );
};

export default Catagories;
