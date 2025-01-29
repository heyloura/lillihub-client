
import { HTMLPage } from "./templates.js";

function getMonthsBetween(date1,date2,roundUpFractionalMonths)
{
    //Months will be calculated between start and end dates.
    //Make sure start date is less than end date.
    //But remember if the difference should be negative.
    var startDate=date1;
    var endDate=date2;
    var inverse=false;
    if(date1>date2)
    {
        startDate=date2;
        endDate=date1;
        inverse=true;
    }

    //Calculate the differences between the start and end dates
    var yearsDifference=endDate.getFullYear()-startDate.getFullYear();
    var monthsDifference=endDate.getMonth()-startDate.getMonth();
    var daysDifference=endDate.getDate()-startDate.getDate();

    var monthCorrection=0;
    //If roundUpFractionalMonths is true, check if an extra month needs to be added from rounding up.
    //The difference is done by ceiling (round up), e.g. 3 months and 1 day will be 4 months.
    if(roundUpFractionalMonths===true && daysDifference>0)
    {
        monthCorrection=1;
    }
    //If the day difference between the 2 months is negative, the last month is not a whole month.
    else if(roundUpFractionalMonths!==true && daysDifference<0)
    {
        monthCorrection=-1;
    }

    return (inverse?-1:1)*(yearsDifference*12+monthsDifference+monthCorrection);
};

export async function AdminTemplate(user, token) {
    const kv = await Deno.openKv();
    const allEntries = await Array.fromAsync(kv.list({prefix:[]}));

    let timeline = '';
    let old = '';
    for (const entry of allEntries) {
        if(entry.key[1] == "timeline" || entry.key[1] == "conversation" ) {
            timeline += `<tr>
                <td><input type="checkbox" name="entry[]" value="${JSON.stringify(entry.key)}" /></td>
                <td><a href="/user/${entry.key[0]}">${entry.key[0]}</a></td>
                <td>${getMonthsBetween(new Date(entry.value.viewed), new Date(), false)} month(s): ${entry.value.viewed}</td>
            </tr>`;
        } else if(entry.key[1] == "global") {
            timeline += `<tr>
                <td><input type="checkbox" name="entry[]" value="${JSON.stringify(entry.key)}" /></td>
                <td><a href="/user/${entry.key[0]}">${entry.key[0]}</a></td>
                <td>${JSON.stringify(entry.value.display)}</td>
            </tr>`;
        } else {
            old += `<tr>
                <td><input type="checkbox" name="entry[]" value="${JSON.stringify(entry.key)}" /></td>
                <td>${JSON.stringify(entry.key)}: ${JSON.stringify(entry.value)}</td>
            </tr>`;
        }

    }

    return HTMLPage(token, `Admin`, `<h1>Current</h1><table class="table">${timeline}</table>
        <h1>Old</h1><table class="table">${old}</table>`, user);
}