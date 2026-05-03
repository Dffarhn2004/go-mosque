import React from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../routes";

const CallToAction = ({ login = false }) => {
  const navigate = useNavigate();

  return (
    <section
      className="w-full py-24 px-8 md:px-16 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
        borderTop: "1px solid rgba(4, 115, 168, 0.1)",
        borderBottom: "1px solid rgba(4, 115, 168, 0.1)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-300"></div>
        <div className="absolute top-20 right-10 w-24 h-24 rounded-full bg-green-300"></div>
        <div className="absolute bottom-10 left-1/4 w-32 h-32 rounded-full bg-yellow-300"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 font-medium rounded-full text-sm mb-6">
          Langkah Berikutnya
        </span>

        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8 leading-tight">
          Mulai dari masjid yang ingin kamu dukung
        </h2>

        <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-8 rounded-full"></div>

        <p className="text-gray-700 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
          Jelajahi masjid terdaftar, lihat transparansi kebutuhannya, lalu
          pilih donasi umum atau campaign yang paling relevan.
          <span className="block mt-2">
            Alurnya lebih jelas untuk donatur dan lebih kuat untuk masjid.
          </span>
        </p>

        {!login && (
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate(routes.public.mosques)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
              style={{ backgroundColor: "#0473A8" }}
            >
              Jelajahi Masjid
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => navigate(routes.admin.login)}
              className="border border-gray-300 bg-white text-gray-800 px-10 py-4 rounded-lg font-bold text-lg transition duration-300 hover:bg-gray-50 shadow-sm"
            >
              Daftarkan Masjid
            </button>
          </div>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="flex items-center">
            <div className="mr-3 p-2 bg-blue-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Akses Profil Masjid</p>
          </div>

          <div className="flex items-center">
            <div className="mr-3 p-2 bg-blue-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Donasi Lebih Transparan</p>
          </div>

          <div className="flex items-center">
            <div className="mr-3 p-2 bg-blue-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Checkout Tetap Cepat</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
