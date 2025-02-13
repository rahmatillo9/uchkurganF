"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/axios";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Register() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await API.post("/users", data);
      toast.success("Successfully registered!");
      router.push("/login");
    } catch (error) {
      toast.error("Registration failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-centeritems-center h-screen bg-gray-100 dark:bg-gray-900">

      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input 
                type="text" 
                placeholder="Enter your full name" 
                {...register("fullname", { required: "Full name is required" })}
              />
              {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname.message}</p>}
            </div>

            <div>
              <Label>Nickname</Label>
              <Input 
                type="text" 
                placeholder="Enter your nickname" 
                {...register("nickname", { required: "Nickname is required" })}
              />
              {errors.nickname && <p className="text-red-500 text-sm">{errors.nickname.message}</p>}
            </div>

            <div>
              <Label>Email (Optional)</Label>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                {...register("email")}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                {...register("password", { required: "Password is required", minLength: 6 })}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
