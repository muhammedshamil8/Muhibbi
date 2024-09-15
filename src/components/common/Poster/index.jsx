import { motion } from 'framer-motion';
import { onStage, offStage } from "@/assets/poster";
import classNames from 'classnames';


const Poster = ({ programName, stage, records }) => {

  const groupRecordsByPlace = (records) => {
    const groupedRecords = {};
    records.forEach((record) => {
      const place = record.fields.Place;
      if (!groupedRecords[place]) {
        groupedRecords[place] = [];
      }
      groupedRecords[place].push(record);
    });
    return groupedRecords;
  };


  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.2 }}

    >
      <div className="max-w-[450px] rounded-lg overflow-hidden mx-auto shadow-xl relative" id='poster'>
        <img
          src={stage === "OFF STAGE" ? offStage : onStage}
          alt="poster"
          className="w-full h-auto object-cover"
        />
        <p className={classNames(
          'font-bold uppercase absolute top-32 left-10',
          {
            'text-purple-800': stage === 'OFF STAGE',
            'text-amber-900': stage === 'ON STAGE'
          })}>
          {programName}
        </p>
        <p
          className={classNames(
            'text-sm absolute top-[150px] left-10 ',
            {
              'text-purple-800': stage === 'OFF STAGE',
              'text-amber-900': stage === 'ON STAGE'
            })}>
          {programName}
        </p>
        <div className='top-[203px] left-[75px] absolute space-y-[10px]'>
          {Object.entries(groupRecordsByPlace(records)).map(([place, records]) => (
            <div key={place} className="flex gap-4 items-start">
              {records.map((record, index) => (
                <div key={index}
                  className={classNames(
                    'flex  flex-col leading-4',
                    {
                      'text-purple-800': stage === 'OFF STAGE',
                      'text-amber-900': stage === 'ON STAGE'
                    })}>
                  <p className={`font-semibold text-md`}>
                    {record.fields.Name}
                  </p>
                  <p className={` text-[11px] `}>
                    {record.fields.Department}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
     
    </motion.div>
  );
};

export default Poster;
