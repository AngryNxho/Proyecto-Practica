from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Device
from core.adapters.snmp_adapter import read_supply


class Command(BaseCommand):
    help = 'Poll devices (printers) and update mapped product stock using adapters'

    def handle(self, *args, **options):
        devices = Device.objects.filter(activo=True)
        for device in devices:
            self.stdout.write(f'Polling {device}...')
            res = None
            if device.protocol.upper() == 'SNMP':
                res = read_supply(device)
            # agregar otros adapters según protocol (IPP, API, etc.)

            if not res:
                self.stdout.write(self.style.WARNING(f'No lectura válida para {device}'))
                continue

            value, max_value = res
            if max_value == 0:
                self.stdout.write(self.style.WARNING(f'Max capacity 0 for {device}'))
                continue

            percent = value / max_value
            product = device.producto

            # Mapear percent a unidades (aquí asumimos que product.stock representa unidades de cartucho)
            # Si deseas usar otra lógica, ajusta product.max_units o similar.
            new_units = int(round(percent * product.stock))

            delta = product.stock - new_units
            tolerance = 1  # tolerancia en unidades para evitar ruidos

            try:
                if delta > tolerance:
                    product.registrar_salida(delta, descripcion='Auto-detect SNMP')
                    self.stdout.write(self.style.SUCCESS(f'Registrada SALIDA {delta} para {product}'))
                elif delta < -tolerance:
                    product.registrar_entrada(-delta, descripcion='Auto-detect SNMP')
                    self.stdout.write(self.style.SUCCESS(f'Registrada ENTRADA {-delta} para {product}'))
                else:
                    self.stdout.write(f'No cambios para {product} (delta={delta})')

                device.ultimo_lectura = timezone.now()
                device.save()
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error actualizando producto para {device}: {e}'))
