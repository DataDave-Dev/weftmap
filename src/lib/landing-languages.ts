/**
 * The per-language landing pages at /[lang]/call-graph/[language].
 *
 * Intentionally free of any import from `@/lib/analysis` — that module tree
 * pulls in the Tree-sitter runtime, and these pages only need names and a
 * snippet. `landing-languages.test.ts` imports the real registry and asserts
 * this list stays in sync, so a newly supported language cannot quietly ship
 * without a landing page.
 */

// A literal union rather than `string`, so `` `landing.${id}` `` narrows to a
// real dictionary key and a typo becomes a compile error instead of an
// undefined title at runtime.
export type LandingId =
  | "python"
  | "javascript"
  | "typescript"
  | "go"
  | "rust"
  | "java"
  | "sql";

export type LandingLanguage = {
  /** Must match the analyzer's `language` value. */
  id: LandingId;
  /** Display name, used in headings and the graph legend. */
  name: string;
  /** Which diagram the analyzer produces for this language. */
  diagram: "call-graph" | "er";
  /** File extension shown on the example, purely cosmetic. */
  extension: string;
  /** A real snippet this language's analyzer turns into a non-trivial graph. */
  snippet: string;
};

// Languages the registry supports that deliberately get no landing page.
// Empty today; kept so the sync test has somewhere to point.
export const EXCLUDED_FROM_LANDING: string[] = [];

export const LANDING_LANGUAGES: LandingLanguage[] = [
  {
    id: "python",
    name: "Python",
    diagram: "call-graph",
    extension: "py",
    snippet: `def main():
    user = fetch_user(1)
    print(render(user))


def fetch_user(user_id):
    row = query_db(user_id)
    return to_dict(row)


def query_db(user_id):
    return (user_id, "Ada Lovelace")


def to_dict(row):
    return {"id": row[0], "name": row[1]}


def render(user):
    return f"{user['id']}: {user['name']}"
`,
  },
  {
    id: "javascript",
    name: "JavaScript",
    diagram: "call-graph",
    extension: "js",
    snippet: `function loadOrders(userId) {
  const raw = fetchOrders(userId);
  return raw.map(normalize);
}

function fetchOrders(userId) {
  return [{ id: 1, userId, items: [{ price: 12 }] }];
}

function normalize(order) {
  return { id: order.id, total: computeTotal(order) };
}

function computeTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price, 0);
}
`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    diagram: "call-graph",
    extension: "ts",
    snippet: `type Order = { id: number; items: { price: number }[] };

function loadOrders(userId: number): Summary[] {
  return fetchOrders(userId).map(normalize);
}

function fetchOrders(userId: number): Order[] {
  return [{ id: userId, items: [{ price: 12 }] }];
}

type Summary = { id: number; total: number };

function normalize(order: Order): Summary {
  return { id: order.id, total: computeTotal(order) };
}

function computeTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price, 0);
}
`,
  },
  {
    id: "go",
    name: "Go",
    diagram: "call-graph",
    extension: "go",
    snippet: `package billing

func Run() int {
	total := SumInvoices(fetchInvoices())
	report(total)
	return total
}

func fetchInvoices() []int {
	return []int{1000, 2500, 400}
}

func SumInvoices(amounts []int) int {
	total := 0
	for _, amount := range amounts {
		total += amount
	}
	return total
}

func report(total int) {
	println(total)
}
`,
  },
  {
    id: "rust",
    name: "Rust",
    diagram: "call-graph",
    extension: "rs",
    snippet: `fn run() -> i32 {
    let total = sum_invoices(fetch_invoices());
    report(total);
    total
}

fn fetch_invoices() -> Vec<i32> {
    vec![1000, 2500, 400]
}

fn sum_invoices(amounts: Vec<i32>) -> i32 {
    amounts.iter().sum()
}

fn report(total: i32) {
    println!("total: {total}");
}
`,
  },
  {
    id: "java",
    name: "Java",
    diagram: "call-graph",
    extension: "java",
    snippet: `class InvoiceService {
    int totalFor(String customer) {
        return sum(load(customer));
    }

    int[] load(String customer) {
        return new int[] { 1000, 2500, 400 };
    }

    int sum(int[] amounts) {
        int total = 0;
        for (int amount : amounts) {
            total += amount;
        }
        return total;
    }
}
`,
  },
  {
    id: "sql",
    name: "SQL",
    diagram: "er",
    extension: "sql",
    snippet: `CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors(id)
);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id),
  rating INTEGER NOT NULL
);
`,
  },
];

export const LANDING_IDS = LANDING_LANGUAGES.map((l) => l.id);

export const LANDING_NAMES = LANDING_LANGUAGES.map((l) => l.name);

export function getLandingLanguage(id: string): LandingLanguage | undefined {
  return LANDING_LANGUAGES.find((l) => l.id === id);
}
