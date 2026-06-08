# TODO

## Admin - menu popover (botão ≡)
- [x] Ajustar `.admin-topbar__menu-area` para ter `z-index: 100` (mantendo `position: absolute; top: 0; right: 0`).
- [x] Ajustar `.admin-menu-toggle` para não interferir no posicionamento (remover `position: absolute; top/right` e garantir `display: inline-flex`).
- [x] Ajustar `.admin-menu-popover` para abrir para baixo e alinhado à esquerda do botão (usar `right: 0; left: auto`) e manter margens.
- [ ] Revalidar no browser: clicar em `≡` no Admin e confirmar que o popover não fica cortado nas bordas direita e superior.

