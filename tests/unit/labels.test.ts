import { describe,expect,it } from "vitest"; import { titleCase } from "@/lib/utils";
describe("display labels",()=>{it.each([["in_progress","In Progress"],["urgent","Urgent"],["ticket_closed","Ticket Closed"]])("formats %s",(input,expected)=>expect(titleCase(input)).toBe(expected))});
