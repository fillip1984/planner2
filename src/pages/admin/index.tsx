import React from "react";

export default function Admin() {
  return (
    <div className="p-4">
      <h3>Admin</h3>

      <div className="mx-auto w-3/4">
        <section>
          <h4>Main Colors</h4>
          <div className="flex flex-wrap gap-2 text-white">
            <div className="bg-primary rounded px-4 py-2">Primary</div>
            <div className="bg-secondary rounded px-4 py-2">Secondary</div>
          </div>
        </section>
        <section>
          <h4>Traditional Colors</h4>
          <div className="flex flex-wrap gap-2 text-white">
            <div className="rounded bg-black px-4 py-2">Black</div>
            <div className="bg-grey rounded px-4 py-2">Grey</div>
            <div className="rounded border border-black bg-white px-4 py-2 text-black">
              White
            </div>
          </div>
        </section>
        <section>
          <h4>Informational Colors</h4>
          <div className="flex flex-wrap gap-2 text-white">
            <div className="bg-danger rounded px-4 py-2">Danger</div>
            <div className="bg-warning rounded px-4 py-2">Warning</div>
            <div className="bg-info rounded px-4 py-2">Info</div>
            <div className="bg-success rounded px-4 py-2">Success</div>s
          </div>
        </section>
      </div>
    </div>
  );
}
