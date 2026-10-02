export type Person = {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  location: string;
  role: "Admin" | "Business owner" | "Bookkeeper" | "Manager" | "Employee";
  manager?: string;
};

export const company = {
  name: "Efficient App",
  legalName: "Efficient App, Inc.",
  location: "Austin, TX",
};

export const currentUser: Person = {
  id: "p_alexander",
  name: "Alexander Bass",
  email: "alexander@efficient.app",
  title: "Head of Finance",
  department: "Finance",
  location: "Austin, TX",
  role: "Admin",
};

export const people: Person[] = [
  currentUser,
  { id: "p_tina", name: "Tina Cruz", email: "tina@efficient.app", title: "Controller", department: "Finance", location: "Austin, TX", role: "Admin", manager: "Alexander Bass" },
  { id: "p_marcus", name: "Marcus Hale", email: "marcus@efficient.app", title: "VP Marketing", department: "Marketing", location: "Seattle", role: "Manager", manager: "Alexander Bass" },
  { id: "p_priya", name: "Priya Raman", email: "priya@efficient.app", title: "Growth Lead", department: "Marketing", location: "New York", role: "Employee", manager: "Marcus Hale" },
  { id: "p_jordan", name: "Jordan Lee", email: "jordan@efficient.app", title: "Account Executive", department: "Sales", location: "San Francisco", role: "Employee", manager: "Sofia Alvarez" },
  { id: "p_sofia", name: "Sofia Alvarez", email: "sofia@efficient.app", title: "Head of Sales", department: "Sales", location: "San Francisco", role: "Manager", manager: "Alexander Bass" },
  { id: "p_ethan", name: "Ethan Park", email: "ethan@efficient.app", title: "Staff Engineer", department: "Engineering", location: "New York", role: "Employee", manager: "Hannah Okafor" },
  { id: "p_hannah", name: "Hannah Okafor", email: "hannah@efficient.app", title: "VP Engineering", department: "Engineering", location: "New York", role: "Manager", manager: "Alexander Bass" },
  { id: "p_liam", name: "Liam Novak", email: "liam@efficient.app", title: "Operations Manager", department: "Operations", location: "New York", role: "Manager", manager: "Alexander Bass" },
  { id: "p_ava", name: "Ava Thompson", email: "ava@efficient.app", title: "Office Manager", department: "Operations", location: "Austin, TX", role: "Employee", manager: "Liam Novak" },
  { id: "p_noah", name: "Noah Kim", email: "noah@efficient.app", title: "Product Designer", department: "Design", location: "Seattle", role: "Employee", manager: "Hannah Okafor" },
  { id: "p_mia", name: "Mia Chen", email: "mia@efficient.app", title: "Bookkeeper", department: "Finance", location: "Austin, TX", role: "Bookkeeper", manager: "Tina Cruz" },
  { id: "p_diego", name: "Diego Santos", email: "diego@efficient.app", title: "Sales Engineer", department: "Sales", location: "San Francisco", role: "Employee", manager: "Sofia Alvarez" },
  { id: "p_grace", name: "Grace Whitfield", email: "grace@efficient.app", title: "Recruiter", department: "People", location: "Remote", role: "Employee", manager: "Liam Novak" },
];

export const departments = ["Marketing", "Operations", "Sales", "Engineering", "Finance", "Design", "People"];
export const locations = ["Austin, TX", "Seattle", "New York", "San Francisco", "Remote"];
