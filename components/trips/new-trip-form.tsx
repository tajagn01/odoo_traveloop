"use client";

import { useState } from "react";
import { Check, Plus, X, MapPin, Calendar } from "lucide-react";
import { createTripAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const PREDEFINED_SUGGESTIONS = [
  { id: "Paris, France", title: "Paris", desc: "Eiffel Tower & Louvre", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" },
  { id: "Tokyo, Japan", title: "Tokyo", desc: "Shinjuku & Mt. Fuji", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" },
  { id: "Rome, Italy", title: "Rome", desc: "Colosseum & Vatican", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80" },
  { id: "New York, USA", title: "New York", desc: "Central Park & Broadway", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80" },
  { id: "Bali, Indonesia", title: "Bali", desc: "Beaches & Temples", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" },
  { id: "London, UK", title: "London", desc: "Big Ben & London Eye", image: "https://images.unsplash.com/photo-1513635269975-5969336cb1f3?auto=format&fit=crop&w=1200&q=80" },
];

type Stop = {
  id: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  hotelName?: string;
  hotelCost?: number;
  transportCost?: number;
  activities: Activity[];
};

type Activity = {
  id: string;
  name: string;
  description?: string;
  time?: string;
  cost?: number;
};

type Expense = {
  id: string;
  category: 'transport' | 'stay' | 'activities' | 'meals';
  amount: number;
  description: string;
  date?: string;
};

export function NewTripForm() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionInput, setSuggestionInput] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [showStopForm, setShowStopForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState<number>(0);

  const addSuggestion = () => {
    const trimmed = suggestionInput.trim();
    if (trimmed) {
      if (!suggestions.includes(trimmed)) {
        setSuggestions((prev) => [...prev, trimmed]);
      }
      setSuggestionInput("");
    }
  };

  const toggleSuggestion = (id: string) => {
    if (suggestions.includes(id)) {
      setSuggestions((prev) => prev.filter((item) => item !== id));
    } else {
      setSuggestions((prev) => [...prev, id]);
    }
  };

  const addStop = (stop: Omit<Stop, 'id' | 'activities'>) => {
    setStops((prev) => [...prev, { ...stop, id: Date.now().toString(), activities: [] }]);
    setShowStopForm(false);
  };

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const addActivityToStop = (stopId: string, activity: Omit<Activity, 'id'>) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId
          ? { ...stop, activities: [...stop.activities, { ...activity, id: Date.now().toString() }] }
          : stop
      )
    );
  };

  const removeActivity = (stopId: string, activityId: string) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId
          ? { ...stop, activities: stop.activities.filter((a) => a.id !== activityId) }
          : stop
      )
    );
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [...prev, { ...expense, id: Date.now().toString() }]);
    setShowExpenseForm(false);
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    let total = 0;
    
    // Add stop costs
    stops.forEach(stop => {
      if (stop.hotelCost) total += stop.hotelCost;
      if (stop.transportCost) total += stop.transportCost;
      stop.activities.forEach(activity => {
        if (activity.cost) total += activity.cost;
      });
    });
    
    // Add manual expenses
    expenses.forEach(expense => {
      total += expense.amount;
    });
    
    return total;
  };

  const totalExpenses = calculateTotalExpenses();
  const remainingBudget = budgetLimit - totalExpenses;
  const budgetPercentage = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 0;

  return (
    <form action={createTripAction} className="space-y-6">
      {/* Trip Name */}
      <div className="space-y-2">
        <Label htmlFor="tripName">Trip Name</Label>
        <Input id="tripName" name="tripName" placeholder="Summer in the Aegean" required />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add a quick overview of your trip."
          rows={3}
        />
      </div>

      {/* Dates row */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Trip Status</Label>
        <select
          id="status"
          name="status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          defaultValue="upcoming"
        >
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Budget Limit */}
      <div className="space-y-2">
        <Label htmlFor="budgetLimit">Budget Limit (Optional)</Label>
        <Input 
          id="budgetLimit" 
          name="budgetLimit" 
          type="number" 
          placeholder="e.g. 5000"
          value={budgetLimit || ''}
          onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">
          Set a budget limit to track your expenses
        </p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location / Starting City</Label>
        <Input id="location" name="location" placeholder="e.g. Athens, Greece" />
      </div>

      {/* Cover Photo */}
      <div className="space-y-2">
        <Label htmlFor="coverPhoto">Cover Photo</Label>
        <Input id="coverPhoto" name="coverPhoto" type="file" accept="image/*" />
      </div>

      {/* Stops / Itinerary Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Stops & Itinerary (Optional)</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add cities and activities for your trip. You can also add these later in the builder.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowStopForm(!showStopForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stop
          </Button>
        </div>

        {/* Add Stop Form */}
        {showStopForm && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-base">Add New Stop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newStopCity">City Name</Label>
                  <Input id="newStopCity" placeholder="e.g. Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newStopCountry">Country</Label>
                  <Input id="newStopCountry" placeholder="e.g. France" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newStopArrival">Arrival Date</Label>
                  <Input id="newStopArrival" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newStopDeparture">Departure Date</Label>
                  <Input id="newStopDeparture" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newStopHotel">Hotel Name (Optional)</Label>
                <Input id="newStopHotel" placeholder="e.g. Grand Hotel" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newStopHotelCost">Hotel Cost (Optional)</Label>
                  <Input id="newStopHotelCost" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newStopTransportCost">Transport Cost (Optional)</Label>
                  <Input id="newStopTransportCost" type="number" placeholder="0" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    const city = (document.getElementById('newStopCity') as HTMLInputElement).value;
                    const country = (document.getElementById('newStopCountry') as HTMLInputElement).value;
                    const arrival = (document.getElementById('newStopArrival') as HTMLInputElement).value;
                    const departure = (document.getElementById('newStopDeparture') as HTMLInputElement).value;
                    const hotel = (document.getElementById('newStopHotel') as HTMLInputElement).value;
                    const hotelCost = (document.getElementById('newStopHotelCost') as HTMLInputElement).value;
                    const transportCost = (document.getElementById('newStopTransportCost') as HTMLInputElement).value;
                    
                    if (city && country && arrival && departure) {
                      addStop({ 
                        cityName: city, 
                        country, 
                        arrivalDate: arrival, 
                        departureDate: departure, 
                        hotelName: hotel,
                        hotelCost: hotelCost ? parseFloat(hotelCost) : undefined,
                        transportCost: transportCost ? parseFloat(transportCost) : undefined,
                      });
                      // Clear form
                      (document.getElementById('newStopCity') as HTMLInputElement).value = '';
                      (document.getElementById('newStopCountry') as HTMLInputElement).value = '';
                      (document.getElementById('newStopArrival') as HTMLInputElement).value = '';
                      (document.getElementById('newStopDeparture') as HTMLInputElement).value = '';
                      (document.getElementById('newStopHotel') as HTMLInputElement).value = '';
                      (document.getElementById('newStopHotelCost') as HTMLInputElement).value = '';
                      (document.getElementById('newStopTransportCost') as HTMLInputElement).value = '';
                    }
                  }}
                >
                  Add Stop
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowStopForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display Added Stops */}
        {stops.length > 0 && (
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <Card key={stop.id} className="border-border/70">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Stop {index + 1}</Badge>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {stop.cityName}, {stop.country}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStop(stop.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stop.hotelName && (
                    <p className="text-sm text-muted-foreground">Hotel: {stop.hotelName}</p>
                  )}
                  {(stop.hotelCost || stop.transportCost) && (
                    <div className="flex gap-4 text-sm">
                      {stop.hotelCost && (
                        <span className="text-muted-foreground">Hotel: ${stop.hotelCost}</span>
                      )}
                      {stop.transportCost && (
                        <span className="text-muted-foreground">Transport: ${stop.transportCost}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Activities for this stop */}
                  {stop.activities.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Activities:</Label>
                      <ul className="space-y-1">
                        {stop.activities.map((activity) => (
                          <li key={activity.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2">
                            <span>{activity.name} {activity.time && `- ${activity.time}`}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeActivity(stop.id, activity.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add Activity Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Activity to {stop.cityName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`activity-name-${stop.id}`}>Activity Name</Label>
                          <Input id={`activity-name-${stop.id}`} placeholder="e.g. Visit Eiffel Tower" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`activity-desc-${stop.id}`}>Description (Optional)</Label>
                          <Textarea id={`activity-desc-${stop.id}`} placeholder="Brief description" rows={2} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`activity-time-${stop.id}`}>Time (Optional)</Label>
                            <Input id={`activity-time-${stop.id}`} type="time" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`activity-cost-${stop.id}`}>Cost (Optional)</Label>
                            <Input id={`activity-cost-${stop.id}`} type="number" placeholder="0" />
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const name = (document.getElementById(`activity-name-${stop.id}`) as HTMLInputElement).value;
                            const description = (document.getElementById(`activity-desc-${stop.id}`) as HTMLTextAreaElement).value;
                            const time = (document.getElementById(`activity-time-${stop.id}`) as HTMLInputElement).value;
                            const cost = (document.getElementById(`activity-cost-${stop.id}`) as HTMLInputElement).value;
                            
                            if (name) {
                              addActivityToStop(stop.id, {
                                name,
                                description: description || undefined,
                                time: time || undefined,
                                cost: cost ? parseFloat(cost) : undefined,
                              });
                              // Clear form
                              (document.getElementById(`activity-name-${stop.id}`) as HTMLInputElement).value = '';
                              (document.getElementById(`activity-desc-${stop.id}`) as HTMLTextAreaElement).value = '';
                              (document.getElementById(`activity-time-${stop.id}`) as HTMLInputElement).value = '';
                              (document.getElementById(`activity-cost-${stop.id}`) as HTMLInputElement).value = '';
                              // Close dialog
                              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                            }
                          }}
                          className="w-full"
                        >
                          Add Activity
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Hidden input to submit stops as JSON */}
        <input
          type="hidden"
          name="stops"
          value={JSON.stringify(stops)}
        />
      </div>

      {/* Budget & Expenses Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <Label className="text-base font-semibold">Budget & Expenses</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Track your trip expenses and manage your budget
          </p>
        </div>

        {/* Budget Overview */}
        {budgetLimit > 0 && (
          <Card className={`border-2 ${budgetPercentage > 100 ? 'border-red-500' : budgetPercentage > 80 ? 'border-yellow-500' : 'border-green-500'}`}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">${budgetLimit.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className={`text-2xl font-bold ${budgetPercentage > 100 ? 'text-red-500' : ''}`}>
                      ${totalExpenses.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ${remainingBudget.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget Usage</span>
                    <span className={`font-semibold ${budgetPercentage > 100 ? 'text-red-500' : ''}`}>
                      {budgetPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        budgetPercentage > 100 ? 'bg-red-500' : 
                        budgetPercentage > 80 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {budgetPercentage > 100 && (
                  <p className="text-sm text-red-500 font-medium">
                    ⚠️ You are over budget by ${(totalExpenses - budgetLimit).toFixed(2)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Breakdown */}
        {(stops.length > 0 || expenses.length > 0) && (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Stop Expenses */}
              {stops.map((stop) => {
                const stopTotal = (stop.hotelCost || 0) + (stop.transportCost || 0) + 
                  stop.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
                
                if (stopTotal === 0) return null;
                
                return (
                  <div key={stop.id} className="space-y-2">
                    <p className="font-semibold text-sm">{stop.cityName}, {stop.country}</p>
                    <div className="space-y-1 pl-4 text-sm">
                      {stop.hotelCost && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hotel</span>
                          <span>${stop.hotelCost.toFixed(2)}</span>
                        </div>
                      )}
                      {stop.transportCost && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transport</span>
                          <span>${stop.transportCost.toFixed(2)}</span>
                        </div>
                      )}
                      {stop.activities.map((activity) => activity.cost && (
                        <div key={activity.id} className="flex justify-between">
                          <span className="text-muted-foreground">{activity.name}</span>
                          <span>${activity.cost.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold pt-1 border-t">
                        <span>Subtotal</span>
                        <span>${stopTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Manual Expenses */}
              {expenses.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="font-semibold text-sm">Additional Expenses</p>
                  <div className="space-y-1 pl-4 text-sm">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="text-muted-foreground">{expense.description}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{expense.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>${expense.amount.toFixed(2)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpense(expense.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Additional Expense */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowExpenseForm(!showExpenseForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Additional Expense
          </Button>

          {showExpenseForm && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-base">Add Expense</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expenseCategory">Category</Label>
                  <select
                    id="expenseCategory"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="transport">Transport</option>
                    <option value="stay">Stay</option>
                    <option value="activities">Activities</option>
                    <option value="meals">Meals</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenseDescription">Description</Label>
                  <Input id="expenseDescription" placeholder="e.g. Airport taxi" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expenseAmount">Amount</Label>
                    <Input id="expenseAmount" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenseDate">Date (Optional)</Label>
                    <Input id="expenseDate" type="date" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      const category = (document.getElementById('expenseCategory') as HTMLSelectElement).value as Expense['category'];
                      const description = (document.getElementById('expenseDescription') as HTMLInputElement).value;
                      const amount = (document.getElementById('expenseAmount') as HTMLInputElement).value;
                      const date = (document.getElementById('expenseDate') as HTMLInputElement).value;
                      
                      if (description && amount) {
                        addExpense({
                          category,
                          description,
                          amount: parseFloat(amount),
                          date: date || undefined,
                        });
                        // Clear form
                        (document.getElementById('expenseDescription') as HTMLInputElement).value = '';
                        (document.getElementById('expenseAmount') as HTMLInputElement).value = '';
                        (document.getElementById('expenseDate') as HTMLInputElement).value = '';
                      }
                    }}
                  >
                    Add Expense
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Hidden input to submit expenses as JSON */}
        <input
          type="hidden"
          name="expenses"
          value={JSON.stringify(expenses)}
        />
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Create Trip &amp; Build Itinerary
      </Button>
      {/* Suggestions for Places / Activities */}
      <div className="space-y-4 pt-2">
        <div>
          <Label className="text-base font-semibold">
            Suggestion for Places to Visit / Activities
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select popular destinations below or add your own ideas to explore while building your itinerary.
          </p>
        </div>

        {/* 3x2 Grid of Image Cards matching Screen 4 wireframe */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PREDEFINED_SUGGESTIONS.map((s) => {
            const isSelected = suggestions.includes(s.id);
            return (
              <Dialog key={s.id}>
                <Card
                  onClick={() => toggleSuggestion(s.id)}
                  className={`relative h-32 md:h-40 overflow-hidden cursor-pointer group transition-all duration-300 border-2 ${
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"
                  }`}
                >
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute inset-0 p-3 flex flex-col justify-between z-10 pointer-events-none">
                    <div className="flex justify-end">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors pointer-events-auto ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-black/40 text-white/70 backdrop-blur-sm group-hover:bg-black/60"
                      }`}>
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm md:text-base leading-tight">
                        {s.title}
                      </h4>
                      <p className="text-white/70 text-[10px] md:text-xs mt-0.5 line-clamp-1 mb-1.5">
                        {s.desc}
                      </p>
                      <div className="pointer-events-auto">
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-6 text-[10px] px-2 bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-md" onClick={(e) => {
                            e.stopPropagation();
                          }}>
                            Preview
                          </Button>
                        </DialogTrigger>
                      </div>
                    </div>
                  </div>
                </Card>

                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-border/70 z-[60]">
                  <div className="relative h-48 sm:h-64 w-full">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <DialogTitle className="text-2xl font-bold">{s.title}</DialogTitle>
                    </div>
                  </div>
                  <div className="p-6 pt-2 space-y-4">
                    <DialogDescription className="text-sm">
                      {s.desc}. A fantastic destination to consider for your next itinerary!
                    </DialogDescription>
                    <div className="pt-2">
                      <Button className="w-full" onClick={() => {
                        if (!isSelected) toggleSuggestion(s.id);
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                      }}>
                        {isSelected ? "Already Added" : "Add Idea to Trip"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* Existing / Custom suggestions */}
        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4 mt-2">
          {suggestions.filter(s => !PREDEFINED_SUGGESTIONS.find(ps => ps.id === s)).length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {suggestions.filter(s => !PREDEFINED_SUGGESTIONS.find(ps => ps.id === s)).map((s, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setSuggestions((prev) => prev.filter((item) => item !== s))}
                    className="text-muted-foreground hover:text-red-500 transition text-xs ml-2 font-medium"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add suggestion input */}
          <div className="flex gap-2">
            <Input
              value={suggestionInput}
              onChange={(e) => setSuggestionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSuggestion();
                }
              }}
              placeholder="Type a custom place or activity name…"
              className="flex-1 bg-background"
            />
            <Button type="button" variant="secondary" onClick={addSuggestion}>
              Add Idea
            </Button>
          </div>
        </div>

        {/* Hidden input to submit suggestions as JSON */}
        <input
          type="hidden"
          name="suggestions"
          value={JSON.stringify(suggestions)}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full sm:w-auto" size="lg">
          Create Trip &amp; Build Itinerary
        </Button>
      </div>
    </form>
  );
}
