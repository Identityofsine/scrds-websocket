import { Observable } from "rxjs";

const x = new Observable<string>((subscriber) => {
  subscriber.next("Hello, world!");
  subscriber.complete();
});

x.pipe(
  (source) => {
    return new Observable<string>((subscriber) => {
      source.subscribe({
        next: (value) => {
          subscriber.next(value.toUpperCase());
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });
  }
).subscribe({
  next: (value) => console.log(value),
  error: (err) => console.error(err),
  complete: () => console.log("Completed"),
});
