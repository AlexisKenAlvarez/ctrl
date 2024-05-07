import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SelectTime = ({ type, disabled }: { type: "open" | "close", disabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState({
    top: 0,
    bottom: 0,
  });

  const ref = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        document.body.style.overflow = "auto";

        document.body.classList.remove("no-scroll");
        setOpen(false);
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
        className="relative w-full"
        variant={"outline"}
        onClick={(e) => {
          e.preventDefault();
          document.body.style.overflow = "hidden";
          document.body.classList.add("no-scroll");
          setOpen((val) => !val);
        }}
      >
        <p className="capitalize">{type} time</p>
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
              "absolute left-0 right-0 z-10 block max-h-72 overflow-y-scroll rounded-md border bg-white p-1 text-sm ",
            )}
            ref={selectRef}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <li
                className="cursor-pointer rounded-md px-10 py-2 hover:bg-slate-100"
                key={`${index + 1} AM`}
                value={`${index + 1} AM`}
              >
                {index + 1} AM
              </li>
            ))}

            {Array.from({ length: 12 }).map((_, index) => (
              <li
                className="cursor-pointer rounded-md px-10 py-2 hover:bg-slate-100"
                key={`${index + 1} PM`}
                value={`${index + 1} PM`}
              >
                {index + 1} PM
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectTime;
