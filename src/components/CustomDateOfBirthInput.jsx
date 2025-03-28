import React, { useState, useRef, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Calendar } from "lucide-react";

const CustomDateOfBirthInput = ({
  label,
  selectedDate,
  onChange,
  minDate,
  placeholder = "GG/MM/AAAA",
}) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentView, setCurrentView] = useState({
    month: selectedDate ? selectedDate.getMonth() : new Date().getMonth(),
    year: selectedDate ? selectedDate.getFullYear() : new Date().getFullYear(),
  });
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  // Formatta la data in formato italiano
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Quando la data selezionata cambia, aggiorna l'input
  useEffect(() => {
    setInputValue(selectedDate ? formatDate(selectedDate) : "");
  }, [selectedDate]);

  // Gestisci il parsing manuale della data
  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    // Prova a parsare la data inserita
    const dateParts = rawValue.split("/");
    if (dateParts.length === 3) {
      const [day, month, year] = dateParts.map(Number);
      const parsedDate = new Date(year, month - 1, day);

      // Validazione della data
      if (
        !isNaN(parsedDate.getTime()) &&
        (!minDate || parsedDate >= minDate) &&
        parsedDate.getDate() === day &&
        parsedDate.getMonth() === month - 1
      ) {
        onChange(parsedDate);
      }
    }
  };

  // Genera i giorni del calendario
  const generateCalendarDays = () => {
    const { year, month } = currentView;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 is Sunday

    const days = [];

    // Pad with previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      const prevMonthDate = new Date(
        year,
        month - 1,
        prevMonthLastDay - startingDay + i + 1
      );
      days.push({
        date: prevMonthDate,
        isCurrentMonth: false,
        isDisabled: false,
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isDisabled: false,
      });
    }

    // Pad with next month's days
    const totalDays = days.length;
    const remainingDays = 42 - totalDays; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDate,
        isCurrentMonth: false,
        isDisabled: false,
      });
    }

    return days;
  };

  // Month names in Italian
  const monthNames = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  // Render the calendar
  const renderCalendar = () => {
    const days = generateCalendarDays();
    const weekdays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

    return (
      <div
        ref={calendarRef}
        style={{
          position: "absolute",
          zIndex: 1050,
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          width: "100%",
          padding: "4px",
          color: "#fff",
          fontSize: "0.7rem",
        }}
      >
        {/* Calendar header with month/year navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
            color: "#ffcc00",
          }}
        >
          <button
            onClick={() =>
              setCurrentView((prev) => ({
                year: prev.month === 0 ? prev.year - 1 : prev.year,
                month: prev.month === 0 ? 11 : prev.month - 1,
              }))
            }
            style={{
              background: "none",
              border: "none",
              color: "#ffcc00",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            {"<"}
          </button>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: "bold",
            }}
          >
            {monthNames[currentView.month]} {currentView.year}
          </div>
          <button
            onClick={() =>
              setCurrentView((prev) => ({
                year: prev.month === 11 ? prev.year + 1 : prev.year,
                month: prev.month === 11 ? 0 : prev.month + 1,
              }))
            }
            style={{
              background: "none",
              border: "none",
              color: "#ffcc00",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            {">"}
          </button>
        </div>

        {/* Weekday headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "2px",
            color: "#888",
            fontSize: "0.6rem",
          }}
        >
          {weekdays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            gap: "1px",
          }}
        >
          {days.map((dayObj, index) => (
            <div
              key={index}
              style={{
                padding: "2px",
                cursor: dayObj.isDisabled ? "not-allowed" : "pointer",
                backgroundColor:
                  selectedDate &&
                  dayObj.date.toDateString() === selectedDate.toDateString()
                    ? "#007bff"
                    : dayObj.isCurrentMonth
                    ? "transparent"
                    : "#151515",
                color:
                  selectedDate &&
                  dayObj.date.toDateString() === selectedDate.toDateString()
                    ? "white"
                    : dayObj.isCurrentMonth
                    ? "#fff"
                    : "#666",
                borderRadius: "2px",
              }}
              onClick={() => {
                if (!dayObj.isDisabled) {
                  onChange(dayObj.date);
                  setIsCalendarVisible(false);
                }
              }}
            >
              {dayObj.date.getDate()}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Gestione dei click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsCalendarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Form.Label
        style={{
          color: "#ffcc00",
          fontSize: "0.9rem",
          marginBottom: "4px",
        }}
      >
        {label}
      </Form.Label>
      <div style={{ position: "relative" }}>
        <Form.Control
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{
            borderColor: "#444",
            color: "#fff",
            paddingRight: "40px",
            fontSize: "0.9rem",
          }}
        />
        <div
          onClick={() => setIsCalendarVisible(!isCalendarVisible)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <Calendar color="#ffcc00" size={18} />
        </div>
      </div>
      {isCalendarVisible && renderCalendar()}
    </div>
  );
};

export default CustomDateOfBirthInput;
