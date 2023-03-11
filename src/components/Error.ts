import { logdb } from "../store/logdata";
import { RegisterState } from "../store/store";
import { sendRegisterStatus } from "../mmsapi";

// Error codes and messages
export const Error = new Map();
Error.set(0, "Unbekannter Fehler");
Error.set(1, "Keine Verbindung zum Scanner");
Error.set(2, "Keine Verbindung zum Bezahl Service");
Error.set(3, "Keine Verbindung zum Bezahl Terminal");
Error.set(4, "Initialisierung des Bezahl Terminal fehlgeschlagen");
Error.set(5, "Das Bezahl Terminal mach gerade ein Software-Update");
Error.set(6, "Scanner nicht angeschlossen");
Error.set(7, "Bankomatzahlung fehlgeschlagen! Bitte noch einmal versuchen");
Error.set(8, "Keine Verbindung zum Kassen Service");
Error.set(9, "Fehler bei der Verarbeitung des Boniervorgangs");
Error.set(10, "Artikel mit diesem Code nicht erfasst");
Error.set(11, "Kassa nicht angemeldet");
Error.set(12, "Kassenanmeldung fehlgeschlagen :(");
Error.set(13, "Kassenanmeldung erfolgreich :)");
Error.set(14, "Kassenanmeldung auf FinanzOnline noch nicht bestätigt");
Error.set(15, "Kassenabschluss des Bezahl Terminals erforderlich");
Error.set(16, "Fehler beim Abholen der Kassen-Konfiguration");
Error.set(17, "Senden der Rechnung an den Drucker fehlgeschlagen");
Error.set(18, "Fehler beim Abholen der Unternehmensdaten");
Error.set(19, "Maximale Artikelanzahl pro Bon erreicht!");
Error.set(20, "Keine Verbindung zum RFID-Modul");
Error.set(21, "RFID-Modul nicht angeschlossen");
Error.set(22, "Fehler beim Abholen der Kundendaten");
Error.set(23, "RFID nicht angelegt");
Error.set(24, "Kontostand konnte nicht eruiert werden");
Error.set(25, "Fehler beim Abholen des Kontostands");
Error.set(26, "Keine Verbindung zum RFID-Service");

Error.set(901, "Rechnung wird gedruckt");

export const ErrorType = {
  E_UNKNOWN: 0,
  E_NETWORK: 1,
  E_UNAVAILABLE: 2,
  E_NOTFOUND: 3,
  E_UNAUTHORIZED: 4,
  E_DEPENDENCY: 5,
  E_CONFLICT: 6,
  E_MAX_ARTICLE_COUNT: 7,
  E_SERVER_ERROR: 8,
};

export const ErrorCause = new Map();
ErrorCause.set("Network", ErrorType.E_NETWORK);
ErrorCause.set("code 500", ErrorType.E_SERVER_ERROR);
ErrorCause.set("code 503", ErrorType.E_UNAVAILABLE);
ErrorCause.set("code 404", ErrorType.E_NOTFOUND);
ErrorCause.set("not found", ErrorType.E_NOTFOUND);
ErrorCause.set("code 401", ErrorType.E_UNAUTHORIZED);
ErrorCause.set("code 424", ErrorType.E_DEPENDENCY);
ErrorCause.set("code 409", ErrorType.E_CONFLICT);
ErrorCause.set("code 418", ErrorType.E_MAX_ARTICLE_COUNT);

export function SetError(
  store: RegisterState,
  err: string,
  errorMap: Map<number, number>
) {
  var e = 0;
  var errmes = err["message"] ? err["message"] : "no message in error"
  ErrorCause.forEach((key, str: string) => {
    var errNr = errorMap.get(key)
    if (errmes.includes(str)) {
      store.error = {
        nr: errNr ? errNr : 0,
        err: err,
      }
      logdb.newError(Error.get(store.error.nr), JSON.stringify(err));
      clearTimeout(store.errorIdleTimer)
      sendRegisterStatus(store)
      store.errorIdleTimer = setTimeout(() => {
        store.error = null;
      }, store.error_idle_timeout, store);
    }
  });
}

export function setDeviceState(store: RegisterState, device: string, state: number) {
  if (store.devices[device] && state == 0) {
    console.log(`${device} working again`)
  }
  if (store.devices[device] == 0 && state > 0) {
    console.log(`${device} out of order`)
  }
  store.devices[device] = state
}
