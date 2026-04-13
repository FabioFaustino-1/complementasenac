import React from 'react';
import { LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen, activePage, menuItems = [], userName, userEmail }) => {
  return (
    <>
      {/* Overlay para fechar no mobile ao clicar fora */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-top">
            {/* Logo Section */}
            <div className="sidebar-logo-section">
              <div className="sidebar-logo-text">
                <div className="senac-txt">Senac</div>
                <div className="comp-txt">Complementares</div>
              </div>
            </div>

            {/* Lista de Navegação Dinâmica via Props */}
            <nav className="nav-list">
              {menuItems.map((item) => {
                const isSelected = activePage === item.id;
                return (
                  <div 
                    key={item.id} 
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
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Rodapé da Sidebar */}
          <div className="sidebar-footer">
            <div className="btn-logout" onClick={() => setIsOpen(false)}>
              <div className="nav-icon-circle">
                <LogOut size={20} color="white" />
              </div>
              <span>Sair da Conta</span>
            </div>
            <div className="footer-user-info">
              <div className="user-name-bold">{userName || "Usuário"}</div>
              <div className="user-email">{userEmail || "email@exemplo.com"}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;