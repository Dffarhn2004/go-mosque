import MosqueCard from "../MosqueCard";

const FeaturedMosques = () => {
  const mosques = [
    {
      id: 1,
      image: "/Masjid1.jpg",
      title: "Pembangunan Teras Masjid",
      name: "Masjid An-nur",
      description: "Pembangunan teras masjid untuk kenyamanan jamaah saat beribadah",
      currentAmount: 25000000,
      targetAmount: 27000000,
    },
    {
      id: 2,
      image: "/Masjid2.jpg",
      title: "Renovasi Kubah Masjid",
      name: "Masjid Al-Ikhlas",
      description: "Renovasi kubah masjid yang telah rusak akibat cuaca ekstrem",
      currentAmount: 15000000,
      targetAmount: 30000000,
    },
    {
      id: 3,
      image: "/Masjid3.jpg",
      title: "Pembangunan Tempat Wudhu",
      name: "Masjid Al-Hidayah",
      description: "Pembangunan tempat wudhu yang lebih luas untuk jamaah",
      currentAmount: 10000000,
      targetAmount: 20000000,
    },
  ];

  return (
    <section className="py-16 px-8 md:px-32 bg-gray-50">
      <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 lg:mb-16 mb-8">
        Masjid Membutuhkan Kamu Segera!
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mosques.map((mosque) => (
          <MosqueCard key={mosque.id} {...mosque} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedMosques;
