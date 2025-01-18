import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom"; // Import Link
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const MedicineCarousel = ({ products, addToCart }) => {
  return (
    <div className="px-8">
      <h1 className="text-center font-lato text-3xl m-10 mb-6">Medicines</h1>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
        }}
        autoplay={{ delay: 3000 }}
        spaceBetween={10}
        slidesPerView={4}
        loop={true}
        onSwiper={(swiper) => swiper.update()}
        className="min-h-[400px] max-w-[1000px] mx-auto"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="max-w-xs bg-[#f8fff4] rounded-lg overflow-hidden shadow-md pb-8">
              <div>
                <Link to={`/products/${product._id}`}>
                  <h3 className="font-semibold text-white text-md text-center bg-[#225f6a] w-full mb-4 p-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-center mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-28 h-28 object-cover rounded-md mx-auto"
                    />
                  </div>
                  <div className="flex">
                    <p className="text-gray-600 font-semibold text-sm mb-1 ml-2 w-52">
                      {product.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-sm mb-2 ml-2 w-52">
                      {product.type}
                    </p>
                  </div>
                  <div className="flex justify-start mb-2 ml-1">
                    <img
                      src={product.brand}
                      alt="Brand"
                      className="h-6 object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <p className="text-[#707a81] font-semibold text-xs mb-2 ml-1">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-[#62965b] font-bold font-lato ml-2">
                      ₹{product.price}
                    </span>
                    {product.discount && (
                      <span className="text-xs font-semibold text-white bg-[#ec6666] px-1 py-1 mr-2 rounded-md">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => addToCart(product._id)}
                  className="mt-2 w-full mx-auto bg-[#4a8694] text-white py-2 px-4 rounded-md hover:bg-[#3a6a74]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      {/* <div
        className="swiper-button-next pr-56 pt-48 absolute top-1/2 right-0 transform -translate-y-1/2 z-10 text-gray-700"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="red"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
      <div
        className="swiper-button-prev pl-56 pt-48 absolute top-1/2 left-0 transform -translate-y-1/2 z-10 text-gray-700"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div> */}
    </div>
  );
};

export default MedicineCarousel;
