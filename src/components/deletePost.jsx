'use client'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import API from "@/lib/axios";

const DeletePostButton = ({ postId, onDeleteSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const deletePost = async () => {
    setLoading(true);
    try {
      await API.delete(`/posts/${postId}`);
      onDeleteSuccess(postId);

      toast({
        title: "Success",
        description: "Post muvaffaqiyatli o‘chirildi",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Postni o‘chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">O‘chirish</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Postni o‘chirmoqchimisiz?</AlertDialogTitle>
          <AlertDialogDescription>
            Ushbu amalni bekor qilib bo‘lmaydi. Post butunlay o‘chadi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline">Bekor qilish</Button>
          <Button variant="destructive" onClick={deletePost} disabled={loading}>
            {loading ? "O‘chirilmoqda..." : "Ha, o‘chirish"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePostButton;
