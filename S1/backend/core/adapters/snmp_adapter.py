"""
SNMP adapter para leer niveles de consumibles desde impresoras usando pysnmp.
Función principal: read_supply(device, index=1) -> (value, max_value) o None si falla.
"""
from pysnmp.hlapi import (
    SnmpEngine,
    CommunityData,
    UdpTransportTarget,
    ContextData,
    ObjectType,
    ObjectIdentity,
    getCmd,
)


def read_supply(device, index=1, timeout=2, retries=1):
    """Lee prtMarkerSupplies y prtMarkerSuppliesMaxCapacity para un índice dado.

    device: instancia del modelo Device con campos `ip`, `snmp_community`, `snmp_version`.
    index: índice del supply en la impresora (1..n)
    Retorna tupla (value, max_value) como enteros o None en caso de error.
    """
    # OIDs estándar (Printer-MIB)
    oid_supply = f'1.3.6.1.2.1.43.11.1.1.6.{index}'
    oid_max = f'1.3.6.1.2.1.43.11.1.1.8.{index}'

    community = device.snmp_community or 'public'
    try:
        iterator = getCmd(
            SnmpEngine(),
            CommunityData(community, mpModel=1),  # mpModel=1 -> SNMPv2c; for v1 use 0
            UdpTransportTarget((str(device.ip), 161), timeout=timeout, retries=retries),
            ContextData(),
            ObjectType(ObjectIdentity(oid_supply)),
            ObjectType(ObjectIdentity(oid_max)),
        )

        errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
        if errorIndication:
            return None
        if errorStatus:
            return None

        # varBinds contiene tuplas (ObjectIdentity, value)
        values = [int(x[1]) for x in varBinds]
        if len(values) >= 2:
            return values[0], values[1]
        return None
    except Exception:
        return None
