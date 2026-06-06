import React, { useEffect, useRef } from "react";
import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import "./Sidebar.css";

const Sidebar = ({
  isOpen,
  setIsOpen,
  activePage,
  menuItems = [],
  userName,
  userEmail,
  variant = "default",
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <>
      {isOpen ? <div className="sidebar-overlay" onClick={() => setIsOpen(false)} /> : null}

      <div
        ref={modalRef}
        className={`sidebar ${variant === "student-dark" ? "sidebar--student-dark" : ""} ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <div className="sidebar-content">
          <div className="sidebar-top">
            <div className="sidebar-logo-section">
              <div className="sidebar-logo-text">
                <div className="senac-txt">{userName || "Usuário"}</div>
                <div className="comp-txt">{userEmail || ""}</div>

              </div>
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={16} />
              </button>
            </div>


            <nav className="nav-list">
              {menuItems.map((item) => {
                const isSelected = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsOpen(false);
                    }}
                  >
                    <div className={`nav-icon-circle ${isSelected ? "active-border" : ""}`}>
                      {item.icon}
                    </div>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-footer">
            <button type="button" className="btn-logout" onClick={handleLogout}>
              <div className="nav-icon-circle">
                <LogOut size={20} color="currentColor" />
              </div>
              <span>Sair da Conta</span>
            </button>

          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
