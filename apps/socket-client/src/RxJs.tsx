import { fromEvent } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

// počúvame kliknutia a berieme ich len raz za 1s
export const clicks$ = fromEvent(document, 'click').pipe(
    throttleTime(1000),
    map((event: MouseEvent) => ({ x: event.clientX, y: event.clientY }))
);

