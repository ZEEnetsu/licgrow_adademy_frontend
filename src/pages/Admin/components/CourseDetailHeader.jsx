const CourseDetailHeader = ({thumbnail, title, des, duration, instructor, totalEnrolled, language}) => {
  return (
    <div className="flex gap-5">
      <img
        src={thumbnail}
        alt={thumbnail}
        className="h-50 rounded-xl"
      />
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {title}
          </h1>
          <p className="text-text-secondary w-1/2 text-md mt-2">{des}</p>
        </div>
        <div className="">
          <p className="flex justify-between items-center text-sm text-secondary">
            <span>Duration : {duration}</span>
            <span>Instructor : {instructor} </span>
          </p>
          <p className="flex justify-between items-center text-sm text-text-secondary ">
            <span>
              Total enrolled :{" "}
              <span className="text-accent font-semibold">
                {totalEnrolled}
              </span>
            </span>
            <span>Language : {language}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailHeader;
