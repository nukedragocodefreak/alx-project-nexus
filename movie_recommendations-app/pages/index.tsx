import dynamic from "next/dynamic";
const MovieRecommendations = dynamic(() => import("@/components/MovieRecommendationsApp"), { ssr: false });
export default function Home(){ return <MovieRecommendations/>; }