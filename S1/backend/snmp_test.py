import argparse
from core.adapters.snmp_adapter import read_supply


def main():
    parser = argparse.ArgumentParser(description='Probar lectura SNMP de una impresora')
    parser.add_argument('--ip', required=True, help='IP de la impresora')
    parser.add_argument('--community', default='public', help='SNMP community string (default: public)')
    parser.add_argument('--index', type=int, default=1, help='Índice del supply (default: 1)')
    parser.add_argument('--timeout', type=int, default=2, help='Timeout SNMP en segundos')
    args = parser.parse_args()

    # Crear un objeto mínimo simulado con los atributos esperados por read_supply
    class DeviceLike:
        def __init__(self, ip, community):
            self.ip = ip
            self.snmp_community = community
            self.snmp_version = '2c'

    device = DeviceLike(args.ip, args.community)
    res = read_supply(device, index=args.index, timeout=args.timeout)
    if not res:
        print('No se obtuvo lectura. Verifica IP, community, SNMP habilitado y firewall.')
    else:
        value, max_value = res
        percent = (value / max_value) * 100 if max_value else None
        print(f'Lectura OK: value={value}, max={max_value}, percent={percent:.2f}%')


if __name__ == '__main__':
    main()
