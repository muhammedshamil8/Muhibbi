import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchRecords } from "@/utils/airtableService";
import { motion, AnimatePresence } from "framer-motion";
import Poster from "@/components/common/Poster";
import { ChevronLeft, Loader } from "lucide-react"
import html2canvas from 'html2canvas';

function Results() {
    const [resultList, setResultList] = useState([]);
    const [search, setSearch] = useState("");
    const [result, setResult] = useState([]);
    const [showResultCard, setShowResultList] = useState(true);
    const [showCard, setShowCard] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tableName = "Published Programs";
                const filterBy = "";
                const sortField = "auto";
                const sortDirection = "desc";
                const Records = await fetchRecords(
                    tableName,
                    filterBy,
                    sortField,
                    sortDirection
                );
                setResultList(Records);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const getPrograms = async (item) => {
        setShowCard(false);
        setShowResultList(false);
        const SingleRecord = [];

        try {
            const tableName = "Result";
            const filterBy = `{Program} = '${item.fields.Name}'`;
            const sortField = "Points";
            const sortDirection = 'asc';
            const Records = await fetchRecords(
                tableName,
                filterBy,
                sortField,
                sortDirection
            );
            SingleRecord.push({
                programName: item.fields.Name,
                records: Records,
                stage: Records[0]?.fields.Stage,
            });
            setResult(SingleRecord);
            setShowCard(true);
        } catch (error) {
            console.error(error);
        }
    };

    const DownloadPoster = (programName) => {
        setDownloading(true);
        // Get the poster element by its ID or a ref
        const posterElement = document.getElementById('poster');
        // Use html2canvas to capture the poster element as an image
        html2canvas(posterElement).then((canvas) => {
            // Convert the canvas to a data URL (image format)
            const image = canvas.toDataURL('image/png');

            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = image;
            downloadLink.download = `${programName}-poster.png`;

            // Trigger the download
            downloadLink.click();
        }).finally(() => setDownloading(false));

    };

    return (
        <div className="relative overflow-x-hidden">
            <div className="relative z-40 flex flex-col items-center justify-center p-2 md:p-10">
                <NavLink to="/" className="text-black font-semibold text-lg absolute top-6 left-6 md:left-10 z-10 flex  items-center">
                    <ChevronLeft size={20} />&nbsp;Home
                </NavLink>

                <div className="font-bold text-center text-4xl p-10">Results</div>
                <div className="flex justify-center flex-col items-center mx-auto w-full custom-width">
                    <input
                        type="text"
                        placeholder="Search Program"
                        className="bg-[#FFEACC] w-full max-w-[500px] h-12 px-6 border-none rounded-lg focus:outline-none mb-6 min-w-[300px] focus:shadow-lg transition duration-300 ease-in-out"
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowResultList(true);
                            setShowCard(false);
                        }}
                    />
                    <AnimatePresence>
                        {showResultCard && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: 300 }}
                                transition={{ duration: 0.3 }}
                            >
                                {resultList.length ? (
                                    <div className="flex justify-center items-center gap-4 flex-wrap p-1 ">
                                        <AnimatePresence>
                                            {resultList.filter((val) => {
                                                if (search === "") {
                                                    return val;
                                                } else if (
                                                    val.fields.Name.toLowerCase().includes(search.toLowerCase())
                                                ) {
                                                    return val;
                                                }
                                            }).map((item, index) => (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8, x: -300 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.8, x: 300 }}
                                                    transition={{ duration: 0.2, delay: index * 0.1 }}
                                                    key={index}
                                                >
                                                    <div className="bg-stone-200 px-6 py-2 rounded-xl cursor-pointer hover:scale-105 transition-all ease-in-out duration-300" onClick={() => getPrograms(item)}>
                                                        <p className="text-lg md:text-2xl font-medium whitespace-nowrap">{item.fields.Name}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {resultList.filter((val) => val.fields.Name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.5, delay: 1 }}
                                                className="text-rose-500 font-semibold"
                                            >
                                                No search Found
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="font-semibold mx-auto flex gap-2 items-center my-4">Loading <Loader className="animate-spin" /></span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mx-auto w-full my-50">
                    <AnimatePresence>
                        {showCard && (
                            <motion.div
                                initial={{ opacity: 0, x: -300 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 300 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div id="poster" className="w-fit h-fit mx-auto">
                                    <Poster
                                        programName={result[0]?.programName}
                                        stage={result[0]?.stage}
                                        records={result[0]?.records}
                                    />
                                </div>

                                <button
                                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md uppercase text-[16px] mt-4 mx-auto max-w-[450px] w-full flex items-center justify-center transition-all ease-in-out hover:bg-blue-900 custom-width"
                                    onClick={() => DownloadPoster(result[0]?.programName)}
                                    disabled={downloading}
                                >
                                    {!downloading ? "Download Now" : <Loader className="animate-spin" />}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default Results;
