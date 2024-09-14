import { fetchRecords } from "@/utils/airtableService";
import React, { useState, useEffect } from "react";
import Carousel from "./components/Embla";

function Results() {
  const [resultList, setResultList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch programs
        const tableName = "Published Programs";
        const filterBy = "";
        const sortField = "auto";
        const sortDirection = "desc";
        const maxRecords = 4;
        const programs = await fetchRecords(
          tableName,
          filterBy,
          sortField,
          sortDirection,
          maxRecords
        );

        // Fetch results for each program
        const resultsPromises = programs.map(async (program) => {
          const tableName = "Result";
          const filterBy = `{Program} = '${program.fields.Name}'`;
          const sortField = "Point";
          const sortDirection = 'asc';
          const results = await fetchRecords(
            tableName,
            filterBy,
            sortField,
            sortDirection
          );

          return {
            programName: program.fields.Name,
            records: results,
            stage: results[0]?.fields.Stage,
          };
        });

        const resultsList = await Promise.all(resultsPromises);
        setResultList(resultsList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className='text-2xl font-bold md:text-4xl text-center capitalize mb-16'>Result</h1>
      <div className="flex flex-col">
        <Carousel slides={resultList} />
      </div>
    </div>
  );
}

export default Results;
