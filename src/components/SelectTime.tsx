import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SelectTime = ({
  type,
  day,
  value,
  disabled,
  handleTime,
  oppositeValue,
}: {
  type: "open" | "close";
  day: string;
  value: string | null;
  disabled: boolean;
  oppositeValue: string | null;
  handleTime: ({
    type,
    value,
    day,
  }: {
    type: string;
    value: string;
    day: string;
  }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState({
    top: 0,
    bottom: 0,
  });

  const ref = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLUListElement>(null);

  const handleSelect = (val: string) => {
    handleTime({
      day,
      type,
      value: val,
    });
    closeSelect();
  };
  const closeSelect = () => {
    document.body.style.overflow = "auto";

    document.body.classList.remove("no-scroll");
    setOpen(false);
  };

  const isDisabled = (startTime: string | null, time: string) => {
    // Convert the time string to a 24-hour format for easier comparison

    const selectedHour = parseInt(startTime?.split(" ")[0] ?? "8 AM"); 
    const startTimeAmPm = startTime?.split(" ")[1];
    const hour = parseInt(time.split(" ")[0] ?? "0");
    const amPm = time.split(" ")[1];

    // Convert AM/PM to 24-hour format
    const convertedStartTime =
      startTimeAmPm === "AM" ? selectedHour : selectedHour + 12;
    const hour24 = amPm === "AM" ? hour : hour + 12;

    // Disable if the current time is before the selected time
    return hour24 < convertedStartTime;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        closeSelect();
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const elementRect = selectRef.current?.getBoundingClientRect();

      setRect({
        top: elementRect?.top ?? 0,
        bottom: elementRect?.bottom ?? 0,
      });
    };

    // Initial check
    handleScroll();

    // Attach scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  return (
    <div className="relative w-full" ref={ref}>
      <Button
        disabled={disabled}
        className="relative w-full"
        variant={"outline"}
        onClick={(e) => {
          e.preventDefault();
          document.body.style.overflow = "hidden";
          document.body.classList.add("no-scroll");
          setOpen((val) => !val);
        }}
      >
        <p className="font-light capitalize">{value ?? `${type}`}</p>
      </Button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={
              rect.bottom < window.innerHeight
                ? { opacity: 0, y: "0%", scale: 0.9 }
                : { opacity: 0, scale: 0.9, y: "-100%" }
            }
            animate={
              rect.bottom < window.innerHeight
                ? { opacity: 1, y: "0%", scale: 1 }
                : { opacity: 1, scale: 1, y: "-100%" }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute left-0 right-0 z-10 block max-h-72 overflow-y-scroll rounded-md border bg-white p-1 text-sm",
            )}
            ref={selectRef}
          >
            {type === "close" ? (
              <>
                {Array.from({ length: 12 }).map((_, index) => (
                  <li
                    className={cn(
                      "cursor-pointer rounded-md px-10 py-2 hover:bg-slate-100",
                      {
                        "pointer-events-none opacity-50": isDisabled(
                          oppositeValue,
                          `${index} AM`,
                        ),
                      },
                    )}
                    key={`${index + 1} AM`}
                    value={`${index + 1} AM`}
                    onClick={() => handleSelect(`${index + 1} AM`)}
                  >
                    {index + 1} AM
                  </li>
                ))}

                {Array.from({ length: 12 }).map((_, index) => (
                  <li
                    className={cn(
                      "cursor-pointer rounded-md px-10 py-2 hover:bg-slate-100",
                      {
                        "pointer-events-none opacity-50": isDisabled(
                          oppositeValue,
                          `${index} PM`,
                        ),
                      },
                    )}
                    key={`${index + 1} PM`}
                    value={`${index + 1} PM`}
                    onClick={() => handleSelect(`${index + 1} PM`)}
                  >
                    {index + 1} PM
                  </li>
                ))}
              </>
            ) : (
              <>
                {Array.from({ length: 12 }).map((_, index) => (
                  <li
                    className="cursor-pointer rounded-md px-10 py-2 hover:bg-slate-100"
                    key={`${index + 1} AM`}
                    value={`${index + 1} AM`}
                    onClick={() => {
                      handleSelect(`${index + 1} AM`);

                      if (isDisabled(`${index + 1} AM`, oppositeValue!)) {
                        handleTime({
                          day,
                          type: "close",
                          value: `${index + 2} AM`,
                        });
                      }
                    }}
                  >
                    {index + 1} AM
                  </li>
                ))}

                {Array.from({ length: 11 }).map((_, index) => (
                  <li
                    className="cursor-pointer rounded-md px-10 py-2 hover:bg-slate-100"
                    key={`${index + 1} PM`}
                    value={`${index + 1} PM`}
                    onClick={() => {
                      handleSelect(`${index + 1} PM`);

                      if (isDisabled(`${index + 1} PM`, oppositeValue!)) {
                        handleTime({
                          day,
                          type: "close",
                          value: `${index + 2} PM`,
                        });
                      }
                    }}
                  >
                    {index + 1} PM
                  </li>
                ))}
              </>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectTime;
