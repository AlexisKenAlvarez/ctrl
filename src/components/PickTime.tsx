import { useEffect, useState } from "react";
import TimeRangeSlider from "react-time-range-slider";

import { to12Hours } from "@/utils/utils";
import "../styles/ClockStyle.css"

interface props {
  disabled: boolean;
  day: string;
  value: {
    start: string;
    end: string;
  }
  handleTime: ({
    start,
    day,
    end,
  }: {
    start: string;
    day: string;
    end: string;
  }) => void;
}

const PickTime = ({ disabled, day, handleTime, value: {start, end} }: props) => {
  const [value, setValue] = useState({
    start,
    end
  });

  const timeChangeHandler = (time: { start: string; end: string }) => {
    setValue(time);
    handleTime({ start: time.start, end: time.end, day: day });
  };

  

  useEffect(() => {
    setValue({ start, end });
  }, [start, end])

  return (
    <div className=" w-full gap-2">
      <div className="flex justify-between">
        <h1 className="">
          {to12Hours(value.start)}
        </h1>
        <h1 className="">
          {to12Hours(value.end)}
        </h1>
      </div>
      <TimeRangeSlider
        disabled={disabled}
        format={24}
        maxValue={"23:59"}
        minValue={"1:00"}
        name={day}
        onChange={timeChangeHandler}
        step={30}
        value={value}
      />
    </div>
  );
};

export default PickTime;
